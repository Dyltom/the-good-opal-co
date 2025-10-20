#!/bin/bash

# Copy product images from WordPress backup to public folder

BACKUP_ROOT="/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup"
PUBLIC_DIR="/Users/dylanhenderson/the-good-opal-co/public/images/products"

# Read JSON and copy images
counter=0
while IFS= read -r filename; do
  # Find image in backup
  found=$(find "$BACKUP_ROOT" -name "$filename" -type f | head -1)

  if [ -n "$found" ]; then
    cp "$found" "$PUBLIC_DIR/"
    echo "✓ Copied $filename"
    ((counter++))
  else
    echo "✗ Not found: $filename"
  fi
done < <(python3 -c "
import json
with open('/Users/dylanhenderson/the-good-opal-co/wordpress-products.json') as f:
    products = json.load(f)
    for p in products:
        if p.get('image_filename'):
            print(p['image_filename'])
")

echo ""
echo "✅ Copied $counter images"
