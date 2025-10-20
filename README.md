# The Good Opal Co

> Premium Australian opal jewelry ecommerce store - Authentic opals that don't cost the earth

## Overview

The Good Opal Co is a modern, SEO-optimized ecommerce platform for selling authentic Australian opal jewelry. Built with Next.js, Payload CMS, and Stripe, it features:

- Full-featured ecommerce with Stripe checkout
- Jewelry-specific product catalog with material, stone type, and origin tracking
- Certificate of authenticity management
- SEO-optimized product and blog pages
- Content management via Payload CMS
- Beautiful, responsive design with opal-inspired color palette
- Newsletter signup and email marketing
- Blog for opal education and care guides

## Brand

**Tagline**: Australian Opal That Doesn't Cost The Earth

**Color Palette** (inspired by Australian opal):
- Primary Blue: `#0099FF` (vibrant opal blue)
- Teal/Cyan: `#00CCFF` (opal flash)
- Orange/Coral: `#FF6600` (opal fire)
- Pink/Magenta: `#FF3399` (opal color play)
- Yellow Accent: `#FFCC00` (golden flash)

## Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling with opal color palette
- **PostgreSQL** - Primary database

### CMS & Ecommerce
- **Payload CMS 3.0** - Native Next.js integration
  - Built-in admin panel at `/admin`
  - TypeScript-native with full type safety
  - Custom collections for jewelry products
- **Stripe** - Payment processing
- **Payload Ecommerce Plugin** - Complete ecommerce features
  - Products with variants
  - Shopping cart
  - Order management
  - Inventory tracking

### UI Components
- **shadcn/ui** - Accessible React components
- **Radix UI** - Headless component primitives
- **React Email** - Beautiful transactional emails

### Features & Integrations
- **React Email** - Beautiful branded email templates
- **Resend** - Email delivery
- **SEO Plugin** - Automated meta tags and structured data
- **Search Plugin** - Fast indexed search

## Product Categories

- **Opal Rings** - Engagement rings, statement rings, everyday wear
- **Opal Necklaces & Pendants** - Elegant pieces showcasing opal fire
- **Opal Earrings** - Studs, drops, and dangles
- **Opal Bracelets** - Delicate and bold designs
- **Raw Opals** - Unset stones for collectors and custom work
- **Custom Commissions** - Bespoke jewelry design services

## Jewelry-Specific Features

### Product Information
Each product includes:
- Material (sterling silver, gold, platinum)
- Stone type (black opal, white opal, boulder, crystal, fire, matrix)
- Origin (Lightning Ridge, Coober Pedy, etc.)
- Dimensions (length, width, depth in mm)
- Weight (carats or grams)
- Ring size (for rings)
- Care instructions
- Certificate of authenticity

### Australian Sourcing
All opals sourced from Australian mines:
- Lightning Ridge, NSW (black opals)
- Coober Pedy, SA (white opals)
- Mintabie, SA
- Andamooka, SA
- Queensland (boulder opals)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (for deployment)
- Stripe account (for payments)
- Resend account (for emails)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/the-good-opal-co.git
cd the-good-opal-co

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run payload migrate

# Start development server
npm run dev
```

Visit:
- `http://localhost:3000` - Main website
- `http://localhost:3000/admin` - CMS admin panel
- `http://localhost:3000/store` - Product catalog

### Environment Variables

Required variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/goodopale

# Payload CMS
PAYLOAD_SECRET=your-secret-key-minimum-32-characters
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@thegoodopal.co
CONTACT_EMAIL=contact@thegoodopal.co

# Stripe (Ecommerce)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Project Structure

```
the-good-opal-co/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public website
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── store/         # Product catalog
│   │   │   ├── blog/          # Opal education
│   │   │   ├── cart/          # Shopping cart
│   │   │   └── checkout/      # Checkout flow
│   │   ├── (payload)/         # CMS admin
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── sections/          # Page sections
│   │   ├── navigation/        # Header/Footer
│   │   ├── cart/              # Shopping cart components
│   │   └── product/           # Product components
│   ├── emails/                # Email templates
│   │   ├── ContactFormEmail.tsx
│   │   ├── NewsletterWelcomeEmail.tsx
│   │   └── OrderConfirmationEmail.tsx
│   ├── lib/                   # Utilities
│   │   ├── constants.ts       # Brand constants
│   │   ├── stripe.ts          # Stripe integration
│   │   └── email.ts           # Email utilities
│   ├── payload/
│   │   └── collections/       # CMS collections
│   │       ├── Products.ts    # Jewelry products
│   │       ├── Posts.ts       # Blog posts
│   │       ├── Categories.ts  # Product categories
│   │       └── Newsletter.ts  # Subscribers
│   └── styles/                # Global styles
├── public/                    # Static assets
│   └── cropped-cropped-logo-final-goc-1.png
├── .env.example               # Environment template
├── package.json
├── tailwind.config.ts         # Tailwind + brand colors
└── TRANSFORMATION_PLAN.md     # Detailed transformation plan
```

## Key Pages

- **Home** (`/`) - Hero, features, testimonials
- **Shop** (`/store`) - Product catalog with filtering
- **Product Details** (`/store/[slug]`) - Individual product pages
- **Blog** (`/blog`) - Opal education and care guides
- **Cart** (`/cart`) - Shopping cart
- **Checkout** (`/checkout`) - Stripe payment
- **Admin** (`/admin`) - CMS dashboard

## Content Management

### Adding Products

1. Log into `/admin`
2. Navigate to Products collection
3. Click "Create New"
4. Fill in required fields:
   - Name, slug, description
   - Price, stock quantity
   - Category (opal rings, necklaces, etc.)
   - Material, stone type, origin
   - Dimensions and weight
   - Upload images
   - Add care instructions
   - Certificate number (if applicable)
5. Set status to "Published"

### Blog Posts

Create blog content in the Posts collection:
- Opal education (types, formation, history)
- Care & maintenance guides
- Behind-the-scenes stories
- New arrivals and collections
- Customer stories

### Categories

Blog post categories:
- Opal Education
- Care & Maintenance
- Behind the Scenes
- Customer Stories
- New Arrivals

## Email Templates

All emails use The Good Opal Co branding with opal blue colors:

- **Contact Form** - Customer inquiry notifications
- **Newsletter Welcome** - New subscriber welcome
- **Order Confirmation** - Purchase confirmation with order details

Email preview: `npm run email` then visit `http://localhost:3002`

## SEO Optimization

- Metadata configured for all pages
- Product schema with structured data
- SEO plugin auto-generates titles and descriptions
- Search plugin for fast content search
- Sitemap generation
- Open Graph images

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t the-good-opal-co .
docker run -p 3000:3000 the-good-opal-co
```

### Production Checklist

- [ ] Set up production database
- [ ] Configure Stripe production keys
- [ ] Set up Resend for email delivery
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable SSL/HTTPS
- [ ] Configure custom domain
- [ ] Set strong `PAYLOAD_SECRET`
- [ ] Test checkout flow end-to-end
- [ ] Add product images and content
- [ ] Create initial blog posts
- [ ] Test email templates

## Development Roadmap

- [x] Rebrand from Rapid Sites to The Good Opal Co
- [x] Implement opal-inspired color palette
- [x] Configure jewelry product categories
- [x] Add jewelry-specific product fields
- [x] Update email templates
- [ ] Add customer reviews/testimonials
- [ ] Implement wishlist functionality
- [ ] Add size guide
- [ ] Create FAQ page
- [ ] Add shipping information page
- [ ] Create returns policy page
- [ ] Implement Instagram feed integration
- [ ] Add gift card functionality
- [ ] Create custom commission request form

## Contributing

This is a private ecommerce project for The Good Opal Co. For development inquiries, contact the maintainers.

## License

Proprietary - All Rights Reserved

## Support

For questions or support:
- Email: contact@thegoodopal.co
- Admin: Login to `/admin` for content management

---

**The Good Opal Co** - Australian Opal That Doesn't Cost The Earth 💎
