# The Good Opal Co

> Premium jewelry and opal ecommerce store powered by Next.js, Payload CMS, and Stripe.

## Overview

The Good Opal Co is a modern, SEO-optimized ecommerce platform for selling fine jewelry and opals. Built on the Rapid Sites framework, it features:

- Full-featured ecommerce with Stripe checkout
- Product catalog with images, variants, and inventory management
- SEO-optimized product and blog pages
- Content management via Payload CMS
- Beautiful, responsive design with Tailwind CSS
- Newsletter signup and email marketing capabilities

## Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **PostgreSQL** - Primary database

### CMS & Content
- **Payload CMS 3.0** - Native Next.js integration, installed directly into the app
  - Built-in admin panel at `/admin`
  - TypeScript-native with full type safety
  - Collections for blogs, pages, media, etc.
  - Only 27 dependencies (vs 88 in v2)

### UI Components
- **shadcn/ui** - Copy-paste components with full control
- **Magic UI / Aceternity UI** - Premium animated components for landing pages
- **Framer Motion** - Smooth animations

### Features & Integrations
- **Cal.com** - Self-hosted booking and scheduling (optional)
- **Drizzle ORM** - Type-safe database access
- **Clerk / NextAuth** - Authentication (for multi-tenant admin)

### Deployment
- **Docker** - Containerized deployments
- **Coolify** - Self-hosted PaaS (recommended)
- Alternative: Vercel, Railway, any Node.js host

## Architecture

### Multi-Tenant Approach

This framework uses a **multi-tenant architecture** where:
- Single codebase serves multiple client websites
- Each client has isolated data via database tenancy
- Clients access their own admin panel with scoped permissions
- Subdomains or custom domains route to the correct tenant
- Shared infrastructure = lower costs per client

**Benefits:**
- Deploy once, serve many clients
- Single version of code to maintain
- Updates propagate automatically
- Cost-effective: $0.40-2/month per site on shared infrastructure
- Easy to manage and scale

**When to Use Separate Deployments:**
- Enterprise clients needing dedicated resources
- High isolation/security requirements
- Heavy customization beyond template capabilities

## Research Findings

### Why These Technologies?

#### Payload CMS 3.0
- **Next.js Native**: Installs directly into Next.js apps (single codebase)
- **Free & Open Source**: No licensing costs
- **Developer-Friendly**: TypeScript, GraphQL, REST APIs
- **Flexible**: Works with PostgreSQL, MySQL, SQLite
- **Production-Ready**: Built-in job queues, file uploads, admin UI

**Alternatives Considered:**
- Sanity: Great collaboration features but $99/mo for teams, costs scale
- Strapi: Popular but separate deployment, heavier
- Contentful: Enterprise pricing, overkill for small business

#### shadcn/ui
- **Copy-Paste Approach**: Full control, no lock-in
- **Easy Theming**: CSS variables make recoloring simple
- **No Dependencies**: Components live in your codebase
- **Tailwind Integration**: Works seamlessly

**Enhancement Libraries:**
- **Magic UI**: 50+ animated components built on shadcn
- **Aceternity UI**: Beautiful Framer Motion components for marketing sites

#### Cal.com
- **Open Source**: Self-host or embed
- **Next.js Based**: Perfect integration
- **Feature-Rich**: Google Calendar, Zoom, payment integrations
- **Customizable**: Full API and webhook support

**Alternatives:**
- Google Calendar API: Free, simpler, less features
- Calendly embed: Quick but limited, not self-hosted
- Custom build: More work, full control

### Deployment Strategy

#### Coolify (Recommended)
- Open-source, self-hostable Heroku alternative
- Built-in CI/CD from GitHub
- Automatic SSL certificates
- One-click deployments
- Docker-based with Nixpacks support

**Requirements:**
- Minimum 8GB RAM for Next.js builds
- 2vCPU insufficient, 4vCPU+ recommended

**Cost Analysis:**
- VPS (8GB RAM): $20-40/month (Hetzner, DigitalOcean)
- Can host 20-50+ small sites per instance
- **Cost per site: $0.40-2/month**

**Pricing Model for Clients:**
- Setup: $500-2000 (one-time)
- Monthly: $50-150/client
- Your margin: ~95%+ on hosting

## Features

### Core Modules (Planned)

- **Page Builder**: Flexible sections and layouts
- **Booking System**: Cal.com integration or custom
- **Blog**: Full-featured with categories, tags, SEO
- **Contact Forms**: With email notifications
- **Image Galleries**: Optimized with Next.js Image
- **Testimonials**: Client reviews and ratings
- **Pricing Tables**: Service pricing display
- **Team Members**: Staff profiles and bios
- **SEO Tools**: Meta tags, OpenGraph, sitemap
- **Analytics**: Privacy-focused tracking

### Templates (Planned)

- Service Business (plumbers, electricians, contractors)
- Professional Services (lawyers, consultants, accountants)
- Restaurants & Cafes
- Health & Wellness (gyms, yoga studios, therapists)
- Retail & E-commerce (basic product showcase)
- Creative Services (photographers, designers)

### Theming System

- CSS variable-based color schemes
- Per-client customization
- Logo and favicon upload
- Google Fonts integration
- Dark mode support (optional per template)

## Getting Started

> **Status**: Currently in initial setup phase. Full setup instructions coming soon.

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Docker (for deployment)
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/rapid-sites.git
cd rapid-sites

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit `http://localhost:3000` for the main site and `http://localhost:3000/admin` for the CMS.

## Deployment

### Docker + Coolify

```bash
# Build Docker image
docker build -t rapid-sites .

# Deploy to Coolify
# Use the Coolify UI to connect your GitHub repo
# Set environment variables in Coolify dashboard
# Deploy with one click
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# Add Cal.com, email, etc.
```

## Project Structure

```
rapid-sites/
├── .claude/              # Claude Code configuration
├── docs/                 # Documentation
│   ├── ROADMAP.md       # Development roadmap
│   └── RESEARCH.md      # Research findings
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── (app)/       # Main site routes
│   │   ├── (admin)/     # Payload admin
│   │   └── api/         # API routes
│   ├── components/      # Shared components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── sections/    # Reusable page sections
│   │   └── templates/   # Full page templates
│   ├── lib/             # Utilities and helpers
│   ├── payload/         # Payload CMS configuration
│   │   ├── collections/ # Content collections
│   │   └── globals/     # Global settings
│   └── styles/          # Global styles
├── public/              # Static assets
├── docker/              # Docker configuration
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Contributing

This project is currently in early development. Contributions, ideas, and feedback welcome!

## License

MIT

## Acknowledgments

Built on the shoulders of giants:
- [Next.js](https://nextjs.org) - The React Framework
- [Payload CMS](https://payloadcms.com) - The Next.js CMS
- [shadcn/ui](https://ui.shadcn.com) - Re-usable components
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Cal.com](https://cal.com) - Scheduling infrastructure

---

**Status**: 🚧 In Development

For questions or support, open an issue on GitHub.
