#!/bin/sh
set -e
BUILD_ID=$(date +%s)
DIST=dist/client
SRC=client

mkdir -p "$DIST/icons"

sed "s/BUILD_ID/$BUILD_ID/g" "$SRC/index.html" > "$DIST/index.html"
sed 's|\(/icons/icon-[^"]*\)|\1?v='"$BUILD_ID"'|g' "$SRC/manifest.json" > "$DIST/manifest.json"
cp -r "$SRC/icons/"* "$DIST/icons/" 2>/dev/null || true

echo "build:copy -> BUILD_ID=$BUILD_ID"
