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

# Item icons are software-rendered from 3D models, which needs a deep stack.
java -Xmx4g -Xss8m -cp "$BUILD_DIR/classes:$CP" ExtractCollectionLog "$CACHE_DIR" "$REPO_ROOT"
