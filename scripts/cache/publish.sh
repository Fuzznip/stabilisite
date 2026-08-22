#!/usr/bin/env bash
#
# Publishes what extract.sh produced to S3: the item icons the website renders,
# and the catalog the backend seeds its database from. Neither is committed —
# both are derived from the game cache and only change when the game does.
#
#   ./scripts/cache/publish.sh
#
# Run extract.sh first. AWS credentials are read from the sibling backend's
# .env, the same ones stabiliserver uploads Dink screenshots with. Reading these
# objects needs no credentials: the bucket policy allows public GetObject.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILD_DIR="$REPO_ROOT/scripts/cache/.build"
ITEMS_DIR="$BUILD_DIR/items"
CATALOG="$BUILD_DIR/collection_log_catalog.json"
ALLOWLIST="$BUILD_DIR/dink-loot-allowlist.txt"
BACKEND_ENV="$REPO_ROOT/../stabilisite-backend/.env"

# Must match ITEM_ICON_BASE in src/lib/utils/index.ts and CATALOG_URL in the
# backend's scripts/seed_collection_log.py.
BUCKET="stability-event"
ITEMS_PREFIX="collection-log/items"
CATALOG_KEY="collection-log/catalog.json"
ALLOWLIST_KEY="collection-log/dink-loot-allowlist.txt"

for path in "$ITEMS_DIR" "$CATALOG" "$ALLOWLIST"; do
  if [[ ! -e "$path" ]]; then
    echo "Missing $path — run ./scripts/cache/extract.sh first." >&2
    exit 1
  fi
done

if [[ -z "${AWS_ACCESS_KEY_ID:-}" ]]; then
  if [[ ! -f "$BACKEND_ENV" ]]; then
    echo "No AWS credentials in the environment and no $BACKEND_ENV to read them from." >&2
    exit 1
  fi
  set -a
  eval "$(grep -E '^(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_REGION)=' "$BACKEND_ENV")"
  set +a
fi
export AWS_DEFAULT_REGION="${AWS_REGION:-us-east-1}"

# The bucket is BucketOwnerEnforced, so ACLs are disabled — public read comes
# from the bucket policy and --acl would be rejected.

# An item id's icon never changes, so those cache indefinitely.
echo "Uploading $(find "$ITEMS_DIR" -name '*.png' | wc -l | tr -d ' ') icons to s3://$BUCKET/$ITEMS_PREFIX/ ..."
aws s3 sync "$ITEMS_DIR/" "s3://$BUCKET/$ITEMS_PREFIX/" \
  --content-type image/png \
  --cache-control "public, max-age=31536000, immutable" \
  --only-show-errors

# The catalog does change (game updates), and a stale copy would seed stale ids,
# so it gets a short TTL rather than the icons' immutable one.
echo "Uploading the catalog to s3://$BUCKET/$CATALOG_KEY ..."
aws s3 cp "$CATALOG" "s3://$BUCKET/$CATALOG_KEY" \
  --content-type application/json \
  --cache-control "public, max-age=60" \
  --only-show-errors

# Members paste this into Dink's Loot > Item Allowlist, so it needs to be
# readable in a browser rather than downloaded.
echo "Uploading the Dink allowlist to s3://$BUCKET/$ALLOWLIST_KEY ..."
aws s3 cp "$ALLOWLIST" "s3://$BUCKET/$ALLOWLIST_KEY" \
  --content-type "text/plain; charset=utf-8" \
  --cache-control "public, max-age=60" \
  --only-show-errors

echo
aws s3 ls "s3://$BUCKET/$ITEMS_PREFIX/" --summarize | tail -2
CATALOG_PATH="$CATALOG" python3 - <<'PY'
import json, os
rows = json.load(open(os.environ["CATALOG_PATH"]))
items = {row["item_id"] for row in rows}
print(f"   Catalog: {len(rows)} placements, {len(items)} unique items")
PY
echo "   Allowlist: $(wc -l < "$ALLOWLIST" | tr -d ' ') names for Dink"
echo
echo "Seed the database from it with, in stabilisite-backend:"
echo "  PYTHONPATH=. python scripts/seed_collection_log.py"
echo
echo "Members import the allowlist from:"
echo "  https://$BUCKET.s3.us-east-1.amazonaws.com/$ALLOWLIST_KEY"
