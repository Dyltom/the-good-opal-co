# The Good Opal Co - Design System
## Luxury Opal Jewelry Brand Identity

**Version:** 1.0
**Last Updated:** October 20, 2025

---

## Brand Essence

**Mission:** To connect opal lovers with authentic Australian opals through education, transparency, and exceptional craftsmanship.

**Personality:**
- **Authentic:** Genuine, honest, transparent
- **Sophisticated:** Elegant, refined, premium
- **Warm:** Approachable, personal, caring
- **Educational:** Knowledgeable, helpful, patient
- **Australian:** Proud heritage, local craftsmen

**Voice & Tone:**
- Conversational yet refined
- Enthusiastic about opals without being pushy
- Educational without being condescending
- Confident in quality without arrogance

---

## Color System

### Primary Palette

#### Opal Blue (Primary Brand Color)
```css
--opal-blue: #1B4B7C;          /* Deep ocean blue - primary */
--opal-blue-dark: #123456;     /* Darker for hovers */
--opal-blue-light: #2E6FA8;    /* Lighter for backgrounds */
--opal-blue-pale: #E8F2F9;     /* Very light for subtle backgrounds */
```

**Usage:**
- Primary CTAs
- Navigation highlights
- Link colors
- Brand elements

#### Opal Fire (Accent Colors)
```css
/* Turquoise - Opal shimmer */
--opal-turquoise: #40E0D0;
--opal-turquoise-light: #7FFFD4;
--opal-turquoise-dark: #20B2AA;

/* Pink - Feminine warmth */
--opal-pink: #FFB6C1;
--opal-pink-light: #FFD6DD;
--opal-pink-dark: #FF69B4;

/* Purple - Luxury & mystery */
--opal-purple: #9B4DCA;
--opal-purple-light: #C084FC;
--opal-purple-dark: #7C3AED;

/* Gold - Premium metal */
--opal-gold: #D4AF37;
--opal-gold-light: #F4CF67;
--opal-gold-dark: #B8941F;
```

**Usage:**
- Gradients for category cards
- Accent highlights
- Icons and decorative elements
- Hover states

### Neutral Palette

#### Text & Surfaces
```css
/* Dark tones */
--charcoal: #2C2C2C;           /* Primary text */
--charcoal-80: #484848;        /* Secondary text */
--charcoal-60: #6B6B6B;        /* Muted text */
--charcoal-40: #8E8E8E;        /* Disabled text */

/* Light tones */
--cream: #FAF9F6;              /* Primary background */
--cream-dark: #F5F4F1;         /* Alt background */
--warm-grey: #E8E6E3;          /* Borders, dividers */
--warm-grey-light: #F0EFEC;    /* Subtle backgrounds */

/* Pure */
--white: #FFFFFF;
--black: #000000;
```

### Semantic Colors

#### Success, Warning, Error
```css
--success: #10B981;            /* Green - confirmations */
--success-light: #D1FAE5;
--success-dark: #047857;

--warning: #F59E0B;            /* Orange - cautions */
--warning-light: #FEF3C7;
--warning-dark: #D97706;

--error: #EF4444;              /* Red - errors */
--error-light: #FEE2E2;
--error-dark: #DC2626;

--info: #3B82F6;               /* Blue - information */
--info-light: #DBEAFE;
--info-dark: #1D4ED8;
```

### Gradients

#### Opal Fire Gradients
```css
/* Main hero gradient */
--gradient-hero: linear-gradient(
  135deg,
  var(--opal-blue) 0%,
  var(--opal-purple) 50%,
  var(--opal-pink) 100%
);

/* Subtle background */
--gradient-subtle: linear-gradient(
  180deg,
  var(--cream) 0%,
  var(--warm-grey-light) 100%
);

/* Category cards */
--gradient-rings: linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%);
--gradient-necklaces: linear-gradient(135deg, #2DD4BF 0%, #06B6D4 50%, #3B82F6 100%);
--gradient-earrings: linear-gradient(135deg, #F472B6 0%, #FB7185 50%, #FB923C 100%);
--gradient-bracelets: linear-gradient(135deg, #818CF8 0%, #3B82F6 50%, #14B8A6 100%);
--gradient-raw: linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #FB923C 100%);
--gradient-custom: linear-gradient(135deg, #475569 0%, #64748B 50%, #1E293B 100%);
```

---

## Typography

### Font Families

#### Serif - Headlines & Luxury
```css
--font-serif: 'Playfair Display', 'Georgia', serif;
```
**Usage:** H1, H2, featured quotes, luxury emphasis

**Weights:**
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

#### Sans-Serif - Body & UI
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
**Usage:** Body text, navigation, buttons, forms

**Weights:**
- Regular (400)
- Medium (500)
- SemiBold (600)
- Bold (700)

#### Accent - Special Elements
```css
--font-accent: 'Montserrat', sans-serif;
```
**Usage:** Badges, labels, stats, micro-copy

**Weights:**
- Medium (500)
- SemiBold (600)
- Bold (700)

### Type Scale

```css
/* Desktop */
--text-xs: 0.75rem;      /* 12px - captions */
--text-sm: 0.875rem;     /* 14px - small text */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px - large body */
--text-xl: 1.25rem;      /* 20px - intro text */
--text-2xl: 1.5rem;      /* 24px - H5 */
--text-3xl: 1.875rem;    /* 30px - H4 */
--text-4xl: 2.25rem;     /* 36px - H3 */
--text-5xl: 3rem;        /* 48px - H2 */
--text-6xl: 3.75rem;     /* 60px - H1 */
--text-7xl: 4.5rem;      /* 72px - Display */

/* Mobile (scale down 20%) */
--text-6xl-mobile: 3rem;     /* 48px - H1 */
--text-5xl-mobile: 2.4rem;   /* 38px - H2 */
--text-4xl-mobile: 1.875rem; /* 30px - H3 */
```

### Line Heights

```css
--leading-tight: 1.2;    /* Headlines */
--leading-snug: 1.375;   /* Subheads */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625;/* Large body */
--leading-loose: 2;      /* Spacious text */
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;  /* Large headlines */
--tracking-tight: -0.025em;   /* Headlines */
--tracking-normal: 0;         /* Body */
--tracking-wide: 0.025em;     /* All caps */
--tracking-wider: 0.05em;     /* Badges */
--tracking-widest: 0.1em;     /* Micro-copy */
```

### Typography Combinations

#### Hero Title
```css
font-family: var(--font-serif);
font-size: var(--text-6xl); /* 60px */
font-weight: 700;
line-height: var(--leading-tight);
letter-spacing: var(--tracking-tight);
color: var(--charcoal);

@mobile {
  font-size: var(--text-6xl-mobile); /* 48px */
}
```

#### Product Name
```css
font-family: var(--font-serif);
font-size: var(--text-3xl); /* 30px */
font-weight: 600;
line-height: var(--leading-snug);
color: var(--charcoal);
```

#### Body Text
```css
font-family: var(--font-sans);
font-size: var(--text-base); /* 16px */
font-weight: 400;
line-height: var(--leading-relaxed);
color: var(--charcoal-80);
```

#### Button Text
```css
font-family: var(--font-sans);
font-size: var(--text-sm); /* 14px */
font-weight: 600;
line-height: var(--leading-normal);
letter-spacing: var(--tracking-wide);
text-transform: uppercase;
```

---

## Spacing System

### Base Unit: 4px

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Content reading width */
--prose-width: 65ch;
```

---

## Border & Radius

### Border Widths
```css
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
```

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px - subtle */
--radius-md: 0.5rem;    /* 8px - default */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - featured */
--radius-2xl: 1.5rem;   /* 24px - hero */
--radius-full: 9999px;  /* Fully rounded */
```

---

## Shadows

### Elevation System

```css
/* Subtle hover */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Card default */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Card hover */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Modal, dropdown */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Mega-elevation */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Inset (form inputs) */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Colored Shadows (Brand)

```css
/* Opal blue glow */
--shadow-opal: 0 10px 30px -5px rgba(27, 75, 124, 0.2);

/* Gold shimmer */
--shadow-gold: 0 10px 30px -5px rgba(212, 175, 55, 0.3);

/* Purple luxury */
--shadow-purple: 0 10px 30px -5px rgba(155, 77, 202, 0.25);
```

---

## Components

### Buttons

#### Primary Button
```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-6 py-3 rounded-lg
  bg-opal-blue hover:bg-opal-blue-dark
  text-white font-semibold text-sm uppercase tracking-wide
  transition-all duration-200
  shadow-md hover:shadow-lg
  focus:outline-none focus:ring-2 focus:ring-opal-blue focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Button Text
</button>
```

#### Secondary Button (Outline)
```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-6 py-3 rounded-lg
  border-2 border-opal-blue text-opal-blue
  hover:bg-opal-blue hover:text-white
  font-semibold text-sm uppercase tracking-wide
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-opal-blue focus:ring-offset-2
">
  Button Text
</button>
```

#### Ghost Button
```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-4 py-2 rounded-md
  text-charcoal-80 hover:text-opal-blue
  hover:bg-opal-blue-pale
  font-medium text-sm
  transition-colors duration-150
">
  Button Text
</button>
```

### Cards

#### Product Card
```tsx
<div className="
  group relative
  bg-white rounded-lg overflow-hidden
  border border-warm-grey
  hover:shadow-xl hover:border-opal-blue
  transition-all duration-300
">
  {/* Image container */}
  <div className="relative aspect-square overflow-hidden bg-warm-grey-light">
    <img
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      src="product.jpg"
      alt="Product"
    />
    {/* Badges */}
    <div className="absolute top-3 left-3">
      <Badge>New</Badge>
    </div>
  </div>

  {/* Content */}
  <div className="p-6">
    <p className="text-sm text-charcoal-60 uppercase tracking-wide mb-2">
      Category
    </p>
    <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
      Product Name
    </h3>
    <div className="flex items-center justify-between">
      <p className="text-2xl font-bold text-opal-blue">$1,899</p>
      <button className="text-charcoal-60 hover:text-opal-blue transition-colors">
        <HeartIcon />
      </button>
    </div>
  </div>
</div>
```

#### Content Card
```tsx
<div className="
  bg-white rounded-xl p-8
  border border-warm-grey
  hover:border-opal-blue
  transition-colors duration-200
">
  <div className="mb-4">
    <Icon className="w-12 h-12 text-opal-blue" />
  </div>
  <h3 className="font-serif text-2xl font-semibold mb-3">
    Heading
  </h3>
  <p className="text-charcoal-80 leading-relaxed">
    Description text
  </p>
</div>
```

### Badges

```tsx
/* New badge */
<span className="
  inline-flex items-center px-3 py-1
  rounded-full text-xs font-semibold uppercase tracking-wider
  bg-gradient-to-r from-pink-500 to-purple-500
  text-white
">
  New
</span>

/* Stock badge - Low */
<span className="
  inline-flex items-center px-3 py-1
  rounded-full text-xs font-semibold
  bg-warning-light text-warning-dark
">
  Only 2 left
</span>

/* Stock badge - Out */
<span className="
  inline-flex items-center px-3 py-1
  rounded-full text-xs font-semibold
  bg-error-light text-error-dark
">
  Sold Out
</span>

/* Category badge */
<span className="
  inline-flex items-center px-3 py-1
  rounded-full text-xs font-medium uppercase tracking-wide
  bg-opal-blue-pale text-opal-blue
">
  Rings
</span>
```

### Forms

#### Input Field
```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-charcoal">
    Label
  </label>
  <input
    type="text"
    className="
      w-full px-4 py-3
      border border-warm-grey rounded-lg
      bg-white
      text-charcoal placeholder:text-charcoal-40
      focus:outline-none focus:ring-2 focus:ring-opal-blue focus:border-transparent
      transition-shadow duration-150
    "
    placeholder="Placeholder text"
  />
  <p className="text-xs text-charcoal-60">Helper text</p>
</div>
```

#### Select Dropdown
```tsx
<select className="
  w-full px-4 py-3
  border border-warm-grey rounded-lg
  bg-white
  text-charcoal
  focus:outline-none focus:ring-2 focus:ring-opal-blue
  appearance-none bg-[url('chevron-down.svg')] bg-no-repeat bg-right-4
">
  <option>Select option</option>
</select>
```

### Icons

**Style:** Outlined (stroke-width: 1.5-2px)
**Size System:**
```css
--icon-xs: 16px;
--icon-sm: 20px;
--icon-md: 24px;
--icon-lg: 32px;
--icon-xl: 48px;
```

**Library:** Lucide React or Heroicons
**Color:** Inherit from parent or use `text-charcoal-60` as default

---

## Layout Principles

### Whitespace
- **Generous:** Luxury requires breathing room
- **Consistent:** Use spacing scale religiously
- **Purposeful:** Group related elements, separate unrelated

### Grid System
- 12-column grid
- Gutter: 24px (desktop), 16px (mobile)
- Max width: 1280px
- Side padding: 24px minimum

### Hierarchy
1. **Hero:** Largest, most prominent
2. **Primary Content:** Clear visual weight
3. **Supporting Content:** Lighter, smaller
4. **Meta Information:** Subtle, minimal

---

## Animation & Transitions

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth: cubic-bezier(0.45, 0, 0.55, 1); /* Luxury smooth */
```

### Duration
```css
--duration-fast: 150ms;      /* Micro-interactions */
--duration-normal: 250ms;    /* Default */
--duration-slow: 400ms;      /* Emphasis */
--duration-slower: 600ms;    /* Hero elements */
```

### Common Transitions
```css
/* Hover state */
transition: all 200ms var(--ease-smooth);

/* Color change */
transition: color 150ms var(--ease-out);

/* Transform */
transition: transform 300ms var(--ease-smooth);
```

### Scroll Animations
- Fade in on scroll
- Slide up on scroll
- Parallax for hero images
- **Trigger:** 100px before element enters viewport
- **Duration:** 600ms
- **Easing:** ease-smooth

---

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text: Minimum 3:1
- UI elements: Minimum 3:1

### Focus States
```css
/* Visible focus ring */
.focusable:focus {
  outline: 2px solid var(--opal-blue);
  outline-offset: 2px;
}

/* Or ring style */
.focusable:focus {
  box-shadow: 0 0 0 3px rgba(27, 75, 124, 0.2);
}
```

### Touch Targets
- Minimum size: 44×44px
- Spacing between targets: 8px minimum

### Screen Readers
- Meaningful alt text for all images
- ARIA labels where needed
- Semantic HTML structure
- Skip navigation link

---

## Responsive Breakpoints

```css
/* Mobile first approach */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Small laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

### Mobile Optimizations
- Stack columns
- Larger touch targets
- Simplified navigation (hamburger)
- Optimize image sizes
- Reduce animations on low-end devices

---

## Usage Examples

### Homepage Hero
```tsx
<section className="relative h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
  {/* Background image with parallax */}
  <div className="absolute inset-0 bg-[url('/hero-opal.jpg')] bg-cover bg-center opacity-20" />

  {/* Content */}
  <div className="relative z-10 text-center max-w-4xl px-6">
    <span className="inline-block px-4 py-2 mb-6 rounded-full bg-white/90 text-opal-blue text-sm font-semibold uppercase tracking-wider">
      Authentic Australian Opals
    </span>

    <h1 className="font-serif text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
      Each Opal Tells a Story<br />
      Millions of Years in the Making
    </h1>

    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
      Discover the vibrant beauty of authentic Australian opals,
      hand-selected for exceptional fire and color.
    </p>

    <div className="flex gap-4 justify-center flex-wrap">
      <Button size="lg" variant="primary">
        Discover Your Perfect Opal →
      </Button>
      <Button size="lg" variant="outline-white">
        Our Story
      </Button>
    </div>
  </div>

  {/* Scroll indicator */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
    <ChevronDownIcon className="w-8 h-8 text-white" />
  </div>
</section>
```

### Product Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### Trust Badge Bar
```tsx
<div className="bg-cream-dark py-4 border-y border-warm-grey">
  <div className="container mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
      <div className="flex items-center justify-center gap-3">
        <ShieldCheckIcon className="w-6 h-6 text-opal-blue" />
        <span className="font-medium text-charcoal">Certified Authentic</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TruckIcon className="w-6 h-6 text-opal-blue" />
        <span className="font-medium text-charcoal">Free Shipping $500+</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <RefreshIcon className="w-6 h-6 text-opal-blue" />
        <span className="font-medium text-charcoal">30-Day Returns</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <AustraliaIcon className="w-6 h-6 text-opal-blue" />
        <span className="font-medium text-charcoal">Australian Owned</span>
      </div>
    </div>
  </div>
</div>
```

---

## Brand Assets Checklist

### Logos
- [ ] Primary logo (color)
- [ ] Logo lockup with tagline
- [ ] Icon/mark only
- [ ] White version (for dark backgrounds)
- [ ] Black version (for light backgrounds)
- [ ] Minimum size: 120px width

### Favicon
- [ ] 32×32px
- [ ] 180×180px (Apple)
- [ ] 192×192px (Android)
- [ ] 512×512px (High-res)
- [ ] SVG version

### Social Media
- [ ] Open Graph image (1200×630px)
- [ ] Twitter card (1200×600px)
- [ ] Profile images (square, various sizes)

---

## Design Checklist for New Pages

Before launching any new page/feature:

**Visual:**
- [ ] Uses brand colors from palette
- [ ] Typography follows scale & families
- [ ] Spacing uses the spacing system
- [ ] Shadows and borders are consistent
- [ ] Gradients match brand gradients

**UX:**
- [ ] Clear visual hierarchy
- [ ] Obvious CTAs
- [ ] Trust signals visible
- [ ] Mobile responsive
- [ ] Touch targets 44px+
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed

**Accessibility:**
- [ ] Color contrast passes WCAG AA
- [ ] Focus states visible
- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Alt text on images

**Performance:**
- [ ] Images optimized (WebP, sized)
- [ ] Fonts preloaded
- [ ] No layout shift (CLS)
- [ ] Fast interaction (FID < 100ms)
- [ ] Quick load (LCP < 2.5s)

---

## Maintenance

**Review Frequency:** Quarterly
**Owner:** Design lead
**Updates:** Document all changes, version control

**Next Review:** January 2026
