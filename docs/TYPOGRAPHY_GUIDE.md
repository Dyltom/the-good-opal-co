# Typography Guidelines

## Design System Typography

### Font Families
- **Display/Headings**: Playfair Display (serif) - for elegance and luxury feel
- **Body Text**: Inter (sans-serif) - for readability
- **Accent**: Montserrat (sans-serif) - for special elements

### Typography Scale (8px baseline)

#### Display Headings (Marketing Pages)
- **H1**: 36px mobile / 48px tablet / 60px desktop
- **H2**: 30px mobile / 36px tablet / 48px desktop
- **H3**: 24px mobile / 30px desktop

#### Content Headings
- **H1**: 30px mobile / 36px desktop
- **H2**: 24px mobile / 30px desktop
- **H3**: 20px mobile / 24px desktop
- **H4**: 18px mobile / 20px desktop
- **H5**: 16px mobile / 18px desktop
- **H6**: 14px mobile / 16px desktop

#### Body Text
- **Large**: 18px - Lead paragraphs, important content
- **Base**: 16px - Standard body text
- **Small**: 14px - Secondary information
- **Tiny**: 12px - Captions, timestamps

### Line Height
- Headings: `leading-tight` (1.25)
- Body text: `leading-normal` (1.5) or `leading-relaxed` (1.625)
- Captions: `leading-normal` (1.5)

### Font Weights
- Light: 300 - Not used for body text
- Normal: 400 - Body text
- Medium: 500 - Emphasis
- Semibold: 600 - Subheadings, buttons
- Bold: 700 - Headings

### Colors
Primary text colors:
- `text-charcoal` - Main body text
- `text-charcoal-light` - Secondary text
- `text-content-muted` - Muted/disabled text
- `text-white` - Inverse text on dark backgrounds

Brand colors (WCAG AA compliant):
- `text-opal-electric-accessible` - Primary brand color
- `text-fire-pink-dark` - Accent color
- `text-opal-emerald-dark` - Success/positive

### Usage Examples

```tsx
import { Heading, Text, Overline, Caption } from '@/components/ui/Typography'

// Marketing hero section
<Overline>Premium Collection</Overline>
<Heading as="h1" variant="display">
  Australian <GradientText>Opals</GradientText>
</Heading>
<Text size="large" color="muted">
  Handpicked opals from Lightning Ridge
</Text>

// Product card
<Heading as="h3" className="mb-2">
  Black Opal Ring
</Heading>
<Text size="small" color="secondary">
  Sterling Silver Setting
</Text>

// Form labels
<Text as="label" className="font-medium mb-2">
  Email Address
</Text>
```

### Responsive Typography

Use responsive modifiers:
- `text-base md:text-lg` - Scale up on larger screens
- `text-4xl md:text-5xl lg:text-6xl` - Progressive scaling

### Accessibility

1. **Hierarchy**: Maintain clear visual hierarchy with size/weight differences
2. **Contrast**: All text must meet WCAG AA standards
3. **Line Length**: Keep body text between 45-75 characters per line
4. **Spacing**: Use consistent spacing between text elements

### Common Patterns

#### Section Headers
```tsx
<div className="text-center mb-12">
  <Overline>Browse</Overline>
  <Heading as="h2" variant="display" className="mb-4">
    Shop by Category
  </Heading>
  <Text size="large" color="muted" className="max-w-2xl mx-auto">
    Explore our collection of loose opals and jewelry
  </Text>
</div>
```

#### Product Descriptions
```tsx
<Heading as="h1" className="mb-4">
  {product.name}
</Heading>
<div className="flex items-baseline gap-3 mb-6">
  <Text className="text-2xl font-bold">
    {formatCurrency(product.price)}
  </Text>
  {product.compareAtPrice && (
    <Text color="muted" className="line-through">
      {formatCurrency(product.compareAtPrice)}
    </Text>
  )}
</div>
<Text className="mb-8">
  {product.description}
</Text>
```

#### Form Fields
```tsx
<div className="space-y-2">
  <Text as="label" className="font-medium">
    Full Name
  </Text>
  <input className="..." />
  <Caption>
    Enter your name as it appears on your card
  </Caption>
</div>
```