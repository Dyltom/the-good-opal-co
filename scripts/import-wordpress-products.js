#!/usr/bin/env node

/**
 * Import WordPress WooCommerce products from CSV backup
 * Extracts product data and copies images to public folder
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = '/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup/uploads-51/facebook_for_woocommerce/product_catalog_60972e26a8b7435a3adf06371aaf8c88.csv';
const BACKUP_ROOT = '/Users/dylanhenderson/the-good-opal-co/gdopalco-bkup';
const PUBLIC_IMAGES = '/Users/dylanhenderson/the-good-opal-co/public/images/products';

// Read and parse CSV
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

const products = [];
let imageCounter = 1;

// Parse each line
for (let i = 1; i < lines.length && i <= 50; i++) { // First 50 products to start
  const line = lines[i];
  if (!line.trim()) continue;

  // Basic CSV parsing (handles quotes)
  const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  if (!matches || matches.length < 3) continue;

  const title = matches[1]?.replace(/"/g, '') || '';
  const description = matches[2]?.replace(/"/g, '').replace(/<[^>]*>/g, '') || '';
  const imageUrl = matches[3]?.replace(/"/g, '') || '';
  const priceStr = matches[7]?.replace(/"/g, '') || '';
  const availability = matches[8]?.replace(/"/g, '') || '';

  if (!title || !priceStr) continue;

  // Extract price (remove AUD, convert to number)
  const price = parseFloat(priceStr.replace('AUD', ''));
  if (isNaN(price)) continue;

  // Extract image filename from URL
  const imageFilename = imageUrl.split('/').pop();

  // Create slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);

  // Determine category
  let category = 'raw-opals'; // default
  if (title.match(/ring/i)) category = 'opal-rings';
  else if (title.match(/pendant|necklace/i)) category = 'opal-necklaces';
  else if (title.match(/earring|stud/i)) category = 'opal-earrings';
  else if (title.match(/bracelet/i)) category = 'opal-bracelets';

  // Determine stone type
  let stoneType = 'White Opal';
  if (title.match(/black opal/i) || description.match(/black opal/i)) stoneType = 'Black Opal';
  else if (title.match(/boulder/i)) stoneType = 'Boulder Opal';
  else if (title.match(/crystal/i)) stoneType = 'Crystal Opal';
  else if (title.match(/fire opal/i)) stoneType = 'Fire Opal';
  else if (title.match(/doublet/i)) stoneType = 'Doublet';

  // Determine origin
  let origin = 'Australia';
  if (title.match(/lightning ridge/i) || description.match(/lightning ridge/i)) origin = 'Lightning Ridge, NSW';
  else if (title.match(/coober pedy/i) || description.match(/coober pedy/i)) origin = 'Coober Pedy, SA';
  else if (title.match(/queensland/i)) origin = 'Queensland';
  else if (title.match(/mintabie/i)) origin = 'Mintabie, SA';
  else if (title.match(/andamooka/i)) origin = 'Andamooka, SA';

  // Extract weight from description
  const weightMatch = description.match(/(\d+\.?\d*)\s*(ct|cts|carat)/i);
  const weight = weightMatch ? parseFloat(weightMatch[1]) : null;

  products.push({
    id: String(imageCounter),
    title,
    slug,
    description: description.substring(0, 500).trim(),
    price,
    imageUrl,
    imageFilename,
    category,
    stoneType,
    origin,
    weight,
    stock: availability === 'in stock' ? 1 : 0,
  });

  imageCounter++;
}

console.log(`\n✅ Parsed ${products.length} products from CSV`);
console.log(`\n📦 Sample products:`);
console.log(JSON.stringify(products.slice(0, 5), null, 2));

// Write products to JSON file
const outputPath = '/Users/dylanhenderson/the-good-opal-co/wordpress-products.json';
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`\n💾 Saved ${products.length} products to wordpress-products.json`);
