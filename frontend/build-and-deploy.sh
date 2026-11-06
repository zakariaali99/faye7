#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_STATIC="$ROOT_DIR/backend/static/frontend"
TEMPLATES="$ROOT_DIR/backend/templates"

echo "=== Building frontend ==="
npm run build

echo "=== Copying new assets to backend/static/frontend/assets/ ==="
cp -R dist/assets/* "$BACKEND_STATIC/assets/"

echo "=== Copying theme previews to backend/static/frontend/themes/ ==="
mkdir -p "$BACKEND_STATIC/themes"
cp -R dist/themes/* "$BACKEND_STATIC/themes/"

echo "=== Copying favicon to backend/static/frontend/ ==="
cp dist/logo.png dist/favicon.ico dist/apple-touch-icon.png "$BACKEND_STATIC/"

echo "=== Fixing favicon path in built index.html ==="
# Vite copies public/logo.png to dist/ with href="/logo.png"
# In production, it's served at /static/frontend/logo.png
sed -i '' -E 's#href="/(logo\.png|favicon\.ico|apple-touch-icon\.png)"#href="/static/frontend/\1"#g' dist/index.html

echo "=== Copying index.html to templates/ ==="
cp dist/index.html "$TEMPLATES/index.html"

echo "=== Done ==="
echo "Backend static assets updated (existing media preserved)"
