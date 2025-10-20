#!/usr/bin/env python3
"""
Import WooCommerce products from CSV backup
"""
import csv
import json
import re
from pathlib import Path

CSV_PATH = '/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup/uploads-51/facebook_for_woocommerce/product_catalog_b22b5f068021ec84ab5a8b7cecfa4291.csv'

print(f'📁 Using: {CSV_PATH}')
print(f'📦 This is the LARGEST catalog file with the most products\n')

products = []

with open(CSV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    reader = csv.DictReader(f, quoting=csv.QUOTE_ALL)
    product_id = 1

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

        # Extract image filename
        image_filename = image_url.split('/')[-1] if image_url else None

        # Create slug
        slug = re.sub(r'[^a-z0-9\s-]', '', title.lower())
        slug = re.sub(r'\s+', '-', slug)[:60]

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
            'featured': product_id <= 10,  # First 10 featured
        })

        product_id += 1

print(f'\n✅ Parsed {len(products)} products')
print(f'\n📦 Sample products:')
for p in products[:5]:
    print(f"  - {p['title']}: ${p['price']} AUD")

# Write to JSON
output_path = '/Users/dylanhenderson/the-good-opal-co/wordpress-products.json'
with open(output_path, 'w') as f:
    json.dump(products, f, indent=2)

print(f'\n💾 Saved to wordpress-products.json')
print(f'\n🖼️  Found {len([p for p in products if p["image_filename"]])} products with images')
