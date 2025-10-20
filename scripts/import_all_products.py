#!/usr/bin/env python3
"""
Import ALL WooCommerce products from ALL CSV files
"""
import csv
import json
import re
from pathlib import Path
import glob

CSV_DIR = '/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup/uploads-51/facebook_for_woocommerce/'

products = []
seen_slugs = set()
product_id = 1

# Process ALL CSV files
csv_files = glob.glob(CSV_DIR + '*.csv')
print(f'Found {len(csv_files)} CSV files to process...\n')

for csv_file in csv_files:
    print(f'Processing: {Path(csv_file).name}')

    with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, quoting=csv.QUOTE_ALL)
        file_products = 0

        for row in reader:
            title = row.get('title', '').strip()
            description = row.get('description', '').strip()
            price_str = row.get('price', '').replace('AUD', '').strip()
            image_url = row.get('image_link', '').strip()
            availability = row.get('availability', '').strip()

            if not title or not price_str or len(title) < 5:
                continue

            try:
                price = float(price_str)
                if price <= 0:
                    continue
            except:
                continue

            # Clean HTML from description
            description = re.sub(r'<[^>]+>', '', description)
            description = description.replace('&lt;', '<').replace('&gt;', '>')

            # Extract image filename from URL
            image_filename = image_url.split('/').pop() if image_url else None

            # Create slug from title
            slug = re.sub(r'[^a-z0-9\s-]', '', title.lower())
            slug = re.sub(r'\s+', '-', slug)[:60]

            # Skip duplicates
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            # Determine category
            category = 'raw-opals'
            if re.search(r'ring', title, re.I):
                category = 'opal-rings'
            elif re.search(r'pendant|necklace', title, re.I):
                category = 'opal-necklaces'
            elif re.search(r'earring|stud', title, re.I):
                category = 'opal-earrings'
            elif re.search(r'bracelet', title, re.I):
                category = 'opal-bracelets'

            # Stone type
            stone_type = 'White Opal'
            if re.search(r'black opal', title + description, re.I):
                stone_type = 'Black Opal'
            elif re.search(r'boulder', title + description, re.I):
                stone_type = 'Boulder Opal'
            elif re.search(r'crystal', title + description, re.I):
                stone_type = 'Crystal Opal'
            elif re.search(r'doublet', title + description, re.I):
                stone_type = 'Doublet'

            # Origin
            origin = 'Australia'
            if re.search(r'lightning ridge', title + description, re.I):
                origin = 'Lightning Ridge, NSW'
            elif re.search(r'coober pedy', title + description, re.I):
                origin = 'Coober Pedy, SA'
            elif re.search(r'queensland', title + description, re.I):
                origin = 'Queensland'
            elif re.search(r'mintabie', title + description, re.I):
                origin = 'Mintabie, SA'
            elif re.search(r'andamooka', title + description, re.I):
                origin = 'Andamooka, SA'

            # Extract weight
            weight_match = re.search(r'(\d+\.?\d*)\s*(ct|cts)', description, re.I)
            weight = float(weight_match.group(1)) if weight_match else None

            products.append({
                'id': str(product_id),
                'title': title,
                'slug': slug,
                'description': description[:300].strip(),
                'price': price,
                'image_url': image_url,
                'image_filename': image_filename,
                'category': category,
                'stone_type': stone_type,
                'origin': origin,
                'weight': weight,
                'stock': 1 if availability == 'in stock' else 0,
                'featured': product_id <= 12,
            })

            product_id += 1
            file_products += 1

        print(f'  → {file_products} products from this file')

print(f'\n✅ Total unique products: {len(products)}')
print(f'🖼️  Products with images: {len([p for p in products if p["image_filename"]])}')

# Write to JSON
output_path = '/Users/dylanhenderson/the-good-opal-co/wordpress-products.json'
with open(output_path, 'w') as f:
    json.dump(products, f, indent=2)

print(f'💾 Saved to wordpress-products.json')
