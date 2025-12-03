# Product Image Processing Workflow
## From WordPress Backup to Premium Product Gallery

**Goal:** Transform raw backup images into professional, consistent product photography that showcases opal beauty and builds trust.

---

## 1. Image Inventory Assessment

### Current Assets
**Location:** `gdopalco-bkup/uploads/`
**Total Images:** 30+ product photos
**Time Range:** 2018-2025
**File Types:** JPG, WebP
**Quality:** Mixed (some professional, some casual)

### Image Categories Found
Based on filenames:
- **Heart-shaped pieces** (`heartthing-1.jpg`)
- **Dated photography** (`20211129_164407.jpg`)
- **Multiple angles** (numbered variations)
- **Size variations** (WordPress auto-generated)

### Unique Products Estimate
**~8-15 distinct items** (grouped by date/time stamps)

---

## 2. Organizing Images

### Step 1: Copy to Working Directory

```bash
# Create organized structure
mkdir -p /Users/dylanhenderson/the-good-opal-co/product-images-raw
mkdir -p /Users/dylanhenderson/the-good-opal-co/product-images-processed

# Copy all original-size images (not thumbnails)
find gdopalco-bkup/uploads -type f \( -name "*.jpg" -o -name "*.jpeg" \) \
  ! -name "*-[0-9]*x[0-9]*.jpg" \
  -exec cp {} product-images-raw/ \;
```

### Step 2: Group by Product

**Manual Review Required:**
1. Open `product-images-raw/` folder
2. Sort by date modified
3. Group images by timestamp/product:
   - `product-01/` - Heart opal pendant
   - `product-02/` - Black opal ring
   - `product-03/` - etc.

**Naming Convention:**
```
product-{number}-{angle}.jpg

Examples:
product-01-front.jpg
product-01-side.jpg
product-01-detail.jpg
product-01-hand.jpg (on model)
```

### Step 3: Select Best Images

**For Each Product:**
- ✅ **Front view** (main product image)
- ✅ **Side/angle view** (shows dimension)
- ✅ **Detail shot** (opal fire/craftsmanship)
- ⭐ **Lifestyle** (on hand/worn) - if available
- ⭐ **Scale reference** - if available

**Minimum per product:** 2 images
**Ideal per product:** 4-6 images

---

## 3. Image Processing Standards

### Technical Specifications

#### Primary Product Image
- **Dimensions:** 1200×1200px (square)
- **Format:** JPG (original) + WebP (optimized)
- **Quality:** 85% JPG, 80% WebP
- **Background:** Pure white (#FFFFFF) or warm cream (#FAF9F6)
- **Subject position:** Centered, 80% of frame
- **Shadows:** Subtle drop shadow (15% opacity)

#### Gallery Images
- **Dimensions:** 1200×1200px (square)
- **Same specs as primary**
- **Consistent lighting across all images**

#### Thumbnails
- **Dimensions:** 400×400px (square)
- **Format:** WebP primarily
- **Quality:** 75% WebP

#### Zoom Images (Optional)
- **Dimensions:** 2400×2400px
- **High quality for zoom feature**
- **File size limit:** < 500KB

---

## 4. Processing Steps

### Tools Needed
**Option A - Professional:**
- Adobe Photoshop + Lightroom
- Capture One (for batch processing)

**Option B - Free/Affordable:**
- GIMP (free)
- Pixlr (browser-based)
- Photopea (free Photoshop alternative online)
- Squoosh (Google - image optimization)

### Workflow Per Image

#### Step 1: Crop & Straighten
```
1. Open image in editor
2. Crop to square (1:1 ratio)
3. Center product
4. Leave 10% margin around product
5. Straighten if tilted
```

#### Step 2: Background Cleanup
```
1. If white background exists:
   - Levels adjustment: Make whites pure white
   - Clean any dust/artifacts

2. If colored/messy background:
   - Use selection tool (magic wand/pen tool)
   - Select product carefully
   - Delete background
   - Add new white layer underneath
   - OR use AI background remover (remove.bg)
```

#### Step 3: Color Correction
```
1. Adjust white balance (make accurate to real opal)
2. Enhance opal fire (subtle saturation +10-15%)
3. Sharpen details (opal texture, metal work)
4. Adjust brightness/contrast for consistency

⚠️ Don't over-edit - opals should look real!
```

#### Step 4: Add Subtle Shadow
```
1. Duplicate product layer
2. Fill with black
3. Blur: Gaussian blur 20-30px
4. Position under product
5. Reduce opacity to 15-20%
6. Flatten image
```

#### Step 5: Save Multiple Formats
```
1. Save master: PSD/XCF (layered, keep for editing)
2. Export JPG: 1200×1200, 85% quality
3. Export WebP: 1200×1200, 80% quality
4. Export thumbnail WebP: 400×400, 75%
```

---

## 5. Batch Processing

### Using Photoshop Actions
```
1. Record action for one image:
   - Crop to 1200×1200
   - Levels adjustment
   - Sharpen
   - Save as JPG + WebP

2. Apply to all images:
   File > Automate > Batch
   Select folder
   Apply action
   Set destination

3. Manual review each result
```

### Using Command Line (ImageMagick)
```bash
# Install ImageMagick
brew install imagemagick

# Batch resize and optimize
for img in *.jpg; do
  # Resize to 1200x1200
  convert "$img" -resize 1200x1200^ -gravity center -extent 1200x1200 \
    -quality 85 "processed/$(basename $img)"

  # Create WebP
  convert "processed/$(basename $img)" -quality 80 \
    "processed/$(basename $img .jpg).webp"

  # Create thumbnail
  convert "$img" -resize 400x400^ -gravity center -extent 400x400 \
    -quality 75 "thumbnails/$(basename $img .jpg).webp"
done
```

---

## 6. Filename Convention

### Production Filenames
```
{product-slug}-{angle}.{ext}

Examples:
black-opal-ring-sterling-silver-front.jpg
black-opal-ring-sterling-silver-front.webp
black-opal-ring-sterling-silver-side.jpg
black-opal-ring-sterling-silver-detail.jpg
black-opal-ring-sterling-silver-hand.jpg

Thumbnails:
black-opal-ring-sterling-silver-front-thumb.webp
```

### Folder Structure
```
public/
  images/
    products/
      black-opal-ring-sterling-silver/
        front.jpg
        front.webp
        front-thumb.webp
        side.jpg
        side.webp
        detail.jpg
        detail.webp
        hand.jpg
        hand.webp
```

---

## 7. Missing Photography

### Priority Shoots Needed
1. **Lifestyle shots:** Products worn on models
2. **Scale reference:** Hand/body to show size
3. **360° views:** Rotating product shots
4. **Video:** Opal fire movement in light
5. **Certificate photos:** Authenticity papers
6. **Packaging:** Box/presentation shots

### DIY Photography Setup

#### Equipment Needed (Budget)
- **Camera:** iPhone 12+ or any modern smartphone
- **Lighting:** 2× LED softbox lights ($50-100)
- **Background:** White foam board or sweep ($20)
- **Turntable:** Lazy Susan for 360° ($15)
- **Tripod:** Phone/camera tripod ($30)
- **Props:** Ring stands, necklace busts ($40)

**Total Budget:** ~$150-200

#### Setup Instructions
```
1. Place white foam board as background
2. Position product on white surface
3. Place one light at 45° left
4. Place one light at 45° right
5. Camera on tripod, straight-on
6. Natural daylight supplement (near window)
7. Shoot in burst mode
8. Review and select best shots
```

#### Opal Fire Photography
```
💡 Key: Show color play

1. Use diffused lighting (not direct)
2. Rotate product slowly while shooting
3. Capture multiple angles
4. Video option: 10-second rotation
5. Extract best frames from video
```

---

## 8. Product Photo Checklist

For each product listing, verify:

### Image Quality
- [ ] Sharp focus (especially on opal)
- [ ] Accurate colors (not oversaturated)
- [ ] Consistent lighting across all images
- [ ] Clean background (pure white/cream)
- [ ] No dust or artifacts visible
- [ ] Proper exposure (not too dark/bright)

### Image Variety
- [ ] Front/hero shot (main listing image)
- [ ] Side angle (shows dimension)
- [ ] Close-up detail (opal fire, metalwork)
- [ ] Lifestyle/worn (if possible)
- [ ] Scale reference (if possible)
- [ ] Certificate/packaging (bonus)

### Technical Specs
- [ ] Square aspect ratio (1:1)
- [ ] Minimum 1200×1200px
- [ ] JPG + WebP formats
- [ ] Optimized file size (< 300KB)
- [ ] Descriptive filenames
- [ ] Alt text written for SEO

### SEO Optimization
- [ ] Filename: descriptive, hyphenated
- [ ] Alt text: "{Product Name} - {Type} - {Material}"
- [ ] File size optimized (fast loading)
- [ ] Lazy loading implemented
- [ ] Structured data markup (Product schema)

---

## 9. Image Upload Process

### Step 1: Upload to PayloadCMS Media Collection
```
1. Login to admin: /admin
2. Navigate to Media collection
3. Upload all product images
4. Add metadata:
   - Title: Product name + angle
   - Alt text: Descriptive for SEO
   - Caption: (optional)
```

### Step 2: Link to Products
```
1. Create/edit Product in PayloadCMS
2. In "images" array field:
   - Add new image entry
   - Select uploaded media
   - Repeat for each angle
3. Set first image as primary
4. Save product
```

### Step 3: Verify Display
```
1. Visit product page on site
2. Check image quality
3. Test gallery navigation
4. Test zoom feature (if implemented)
5. Check mobile display
6. Verify lazy loading
```

---

## 10. Ongoing Image Guidelines

### When Adding New Products

**Do:**
- ✅ Follow same lighting setup
- ✅ Use same background color
- ✅ Maintain consistent framing
- ✅ Shoot multiple angles
- ✅ Capture opal fire
- ✅ Include scale reference when possible

**Don't:**
- ❌ Mix background colors
- ❌ Use different lighting styles
- ❌ Over-edit colors
- ❌ Use low-resolution images
- ❌ Include watermarks
- ❌ Crop too tightly

### Brand Consistency
All product images should feel like they're from the same collection:
- Same background style
- Similar lighting mood
- Consistent post-processing
- Professional presentation

---

## 11. Advanced Features (Future)

### 360° Product Viewer
**Tool:** ThreeSixty.js or Cloud 360 view
**Process:**
1. Shoot 36 images (10° rotation each)
2. Upload to 360° platform
3. Embed viewer on product page
4. Adds interactivity and luxury feel

### Video Product Tours
**Length:** 10-15 seconds
**Content:**
- Rotate product slowly
- Move through light to show opal fire
- Close-up pan across details
**Format:** MP4, H.264, < 5MB

### AR Try-On (Rings/Jewelry)
**Platform:** Shopify AR or custom
**Requirement:** 3D model of product
**Future consideration for high-end pieces**

---

## 12. Image Performance Checklist

### Optimization
- [ ] All images under 300KB
- [ ] WebP format with JPG fallback
- [ ] Lazy loading implemented
- [ ] Responsive images (srcset)
- [ ] CDN delivery (Vercel, Cloudflare)

### SEO
- [ ] Descriptive filenames
- [ ] Alt text on all images
- [ ] Image sitemap generated
- [ ] Schema markup (Product images)
- [ ] OpenGraph images for social sharing

### UX
- [ ] Fast loading (< 1s)
- [ ] Smooth gallery navigation
- [ ] Zoom on hover/click
- [ ] Mobile swipe gallery
- [ ] Skeleton loaders while loading

---

## 13. Immediate Action Plan

### This Week
1. **Copy all images** from backup to working folder
2. **Identify 5 best products** from existing images
3. **Process these 5 products** (2-3 images each)
4. **Upload to PayloadCMS** media collection
5. **Create 5 real products** with processed images

### Next Week
6. **Set up DIY photo studio** (if budget allows)
7. **Shoot new lifestyle photos** (on hand)
8. **Add 5 more products** from backup images
9. **Write product descriptions** for all 10 products

### Month 1
10. **Process all backup images** (~30 images)
11. **Create 15 products minimum**
12. **Shoot missing angles** for key products
13. **Add video clips** for featured products

---

## 14. Quality Standards

### Acceptable
- ✅ Sharp, well-lit product photos
- ✅ Clean white background
- ✅ Accurate colors
- ✅ 2+ angles per product
- ✅ Optimized file sizes

### Ideal
- 🌟 Professional studio lighting
- 🌟 4-6 angles per product
- 🌟 Lifestyle shots on models
- 🌟 Video of opal color play
- 🌟 360° interactive view
- 🌟 Certificate photos included

### Unacceptable
- ❌ Blurry images
- ❌ Messy backgrounds
- ❌ Poor lighting
- ❌ Only 1 image per product
- ❌ Oversaturated/fake colors
- ❌ Large file sizes (slow loading)

---

## Conclusion

Great product photography is essential for luxury jewelry ecommerce. The images from your WordPress backup are a valuable starting point. By processing them properly and following these guidelines for future photography, you'll create a consistent, professional product catalog that builds trust and drives conversions.

**Remember:**
- Consistency is key
- Opal fire is your selling point - showcase it!
- Multiple angles build confidence
- Professional presentation = perceived value
- Optimize for performance without sacrificing quality

---

## Resources

### Free Tools
- **remove.bg** - AI background removal
- **Squoosh** - Image optimization
- **GIMP** - Free Photoshop alternative
- **Photopea** - Browser-based photo editor
- **Canva** - Graphics and templates

### Paid Tools (Optional)
- **Adobe Creative Cloud** - $54.99/mo (Photoshop + Lightroom)
- **Capture One** - Professional photo editor
- **Cloudinary** - Image hosting CDN

### Learning
- **YouTube:** Product photography tutorials
- **Skillshare:** Jewelry photography courses
- **Lynda.com:** Lightroom/Photoshop courses
