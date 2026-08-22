#!/usr/bin/env bash
# Regenerates the collection log catalog + item icons + interface sprites from a
# local OSRS game cache. Re-run after a game update adds collection log items.
#
#   ./scripts/cache/extract.sh [cacheDir]
#
# cacheDir defaults to RuneLite's cache. Requires Java 11+ and Maven (used only
# to resolve net.runelite:cache, the client's cache-reading library).
set -euo pipefail

CACHE_DIR="${1:-$HOME/.runelite/jagexcache/oldschool/LIVE}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT_DIR="$REPO_ROOT/scripts/cache"
BUILD_DIR="$SCRIPT_DIR/.build"
RUNELITE_CACHE_VERSION="1.12.33"

if [[ ! -f "$CACHE_DIR/main_file_cache.dat2" ]]; then
  echo "No game cache at $CACHE_DIR (expected main_file_cache.dat2)." >&2
  echo "Run the OSRS client or RuneLite once, or pass the cache dir as \$1." >&2
  exit 1
fi

mkdir -p "$BUILD_DIR"
if [[ ! -f "$BUILD_DIR/cp.txt" ]]; then
  echo "Resolving net.runelite:cache:$RUNELITE_CACHE_VERSION ..."
  cat > "$BUILD_DIR/pom.xml" <<POM
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>stabilisite</groupId><artifactId>cache-extract</artifactId><version>1</version>
  <repositories>
    <repository><id>runelite</id><url>https://repo.runelite.net</url></repository>
  </repositories>
  <dependencies>
    <dependency>
      <groupId>net.runelite</groupId><artifactId>cache</artifactId>
      <version>$RUNELITE_CACHE_VERSION</version>
    </dependency>
  </dependencies>
</project>
POM
  mvn -q -B -f "$BUILD_DIR/pom.xml" dependency:build-classpath -Dmdep.outputFile="$BUILD_DIR/cp.txt"
fi

CP="$(cat "$BUILD_DIR/cp.txt")"
javac -nowarn -cp "$CP" -d "$BUILD_DIR/classes" \
  "$SCRIPT_DIR/ExtractCollectionLog.java" "$SCRIPT_DIR/ImageSpriteWriter.java"

# The catalog is published to S3 alongside the icons; the backend seeds its
# database from there. Neither is committed.
CATALOG_OUT="$BUILD_DIR/collection_log_catalog.json"

# Item icons are software-rendered from 3D models, which needs a deep stack.
java -Xmx4g -Xss8m -cp "$BUILD_DIR/classes:$CP" ExtractCollectionLog \
  "$CACHE_DIR" "$REPO_ROOT" "$CATALOG_OUT"

# Dink's loot notifier is gated behind a minimum value, and most collection log
# items are worth less than a typical threshold — so without this, members only
# report their expensive drops. Names on the Item Allowlist always notify,
# whatever the value (LootNotifier sets shouldSend on a name match, independent
# of the value and rarity checks). Derived from the catalog so the two can't
# drift: an item added to the log is on the allowlist the same run.
ALLOWLIST_OUT="$BUILD_DIR/dink-loot-allowlist.txt"
CATALOG_OUT="$CATALOG_OUT" ALLOWLIST_OUT="$ALLOWLIST_OUT" python3 - <<'PY'
import json, os
rows = json.load(open(os.environ["CATALOG_OUT"]))
# One name per line. Dink matches case-insensitively and anchors each entry, so
# exact names are safe; deliberately no wildcards, which would sweep in
# thousands of non-log items and re-enable the loot spam the threshold prevents.
names = sorted({row["name"] for row in rows})
with open(os.environ["ALLOWLIST_OUT"], "w") as f:
    f.write("\n".join(names) + "\n")
size = os.path.getsize(os.environ["ALLOWLIST_OUT"])
print(f"allowlist: {len(names)} item names, {size / 1024:.1f} KB -> {os.environ['ALLOWLIST_OUT']}")
PY

cat <<MSG

Next:
  ./scripts/cache/publish.sh                            # icons + catalog + allowlist -> S3
  (in stabilisite-backend)
  PYTHONPATH=. python scripts/seed_collection_log.py    # S3 catalog -> database
MSG
