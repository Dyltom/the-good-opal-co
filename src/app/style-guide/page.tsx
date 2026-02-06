import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal mb-4 leading-tight">
            The Good Opal Co Style Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A comprehensive guide to our design system ensuring consistency and elegance across all touchpoints
          </p>
        </div>

        {/* Typography */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Typography</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-charcoal">Headings (Playfair Display)</h3>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-tight">
                  Heading 1
                </h1>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                  Heading 2
                </h2>
                <h3 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal leading-snug">
                  Heading 3
                </h3>
                <h4 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
                  Heading 4
                </h4>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-charcoal">Body Text (Inter)</h3>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-700">
                  Large body text for important introductions and hero sections.
                </p>
                <p className="text-lg leading-relaxed text-gray-600">
                  Standard body text used for general content and descriptions throughout the site.
                </p>
                <p className="text-base leading-relaxed text-gray-600">
                  Regular paragraph text that forms the bulk of our written content.
                </p>
                <p className="text-sm text-gray-500">
                  Small text for captions, labels, and secondary information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Colors</h2>

          <div className="space-y-8">
            {/* Brand Colors */}
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-24 bg-opal-electric rounded-lg shadow-md"></div>
                  <p className="font-medium">Opal Electric</p>
                  <p className="text-sm text-gray-500">#00B4D8</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-opal-deep rounded-lg shadow-md"></div>
                  <p className="font-medium">Opal Deep</p>
                  <p className="text-sm text-gray-500">#0077B6</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-fire-pink rounded-lg shadow-md"></div>
                  <p className="font-medium">Fire Pink</p>
                  <p className="text-sm text-gray-500">#FF8FAB</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-opal-emerald rounded-lg shadow-md"></div>
                  <p className="font-medium">Opal Emerald</p>
                  <p className="text-sm text-gray-500">#2ECC71</p>
                </div>
              </div>
            </div>

            {/* Neutral Colors */}
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-4">Neutral Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="h-24 bg-black-rich rounded-lg shadow-md"></div>
                  <p className="font-medium">Black Rich</p>
                  <p className="text-sm text-gray-500">#0A0A12</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-charcoal rounded-lg shadow-md"></div>
                  <p className="font-medium">Charcoal</p>
                  <p className="text-sm text-gray-500">#2C2C2C</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-gray-600 rounded-lg shadow-md"></div>
                  <p className="font-medium">Gray 600</p>
                  <p className="text-sm text-gray-500">#4B5563</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-cream rounded-lg shadow-md"></div>
                  <p className="font-medium">Cream</p>
                  <p className="text-sm text-gray-500">#FAF9F6</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 bg-white rounded-lg shadow-md border"></div>
                  <p className="font-medium">White</p>
                  <p className="text-sm text-gray-500">#FFFFFF</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Buttons</h2>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button>Default Button</Button>
              <Button size="lg">Large Button</Button>
              <Button size="xl">Extra Large Button</Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>

            <div className="bg-black-rich p-8 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <Button variant="glass">Glass Button</Button>
                <Button variant="shimmer">Shimmer Button</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Spacing</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">xs</div>
              <div className="h-4 bg-opal-electric" style={{width: '0.25rem'}}></div>
              <span className="text-sm text-gray-500">4px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">sm</div>
              <div className="h-4 bg-opal-electric" style={{width: '0.5rem'}}></div>
              <span className="text-sm text-gray-500">8px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">md</div>
              <div className="h-4 bg-opal-electric" style={{width: '1rem'}}></div>
              <span className="text-sm text-gray-500">16px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">lg</div>
              <div className="h-4 bg-opal-electric" style={{width: '1.5rem'}}></div>
              <span className="text-sm text-gray-500">24px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">xl</div>
              <div className="h-4 bg-opal-electric" style={{width: '2rem'}}></div>
              <span className="text-sm text-gray-500">32px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">2xl</div>
              <div className="h-4 bg-opal-electric" style={{width: '3rem'}}></div>
              <span className="text-sm text-gray-500">48px</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">3xl</div>
              <div className="h-4 bg-opal-electric" style={{width: '4rem'}}></div>
              <span className="text-sm text-gray-500">64px</span>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Animations</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hover Effects</h3>
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <p>Hover for shadow effect</p>
              </Card>
              <div className="p-6 bg-cream rounded-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer">
                <p>Hover for lift effect</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Loading States</h3>
              <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gradients</h3>
              <div className="h-32 bg-gradient-to-r from-opal-electric to-opal-deep rounded-lg"></div>
              <div className="h-32 bg-gradient-to-r from-fire-pink to-fire-coral rounded-lg"></div>
            </div>
          </div>
        </section>

        {/* Example Components */}
        <section className="space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal border-b pb-4">Component Examples</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Card Example */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-charcoal">Product Card</h3>
              <div className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-opal-electric/20 to-fire-pink/20 group-hover:scale-105 transition-transform duration-300"></div>
                </div>
                <h4 className="font-serif text-lg font-semibold text-charcoal group-hover:text-opal-deep transition-colors duration-200">
                  Australian Boulder Opal Ring
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Stunning play of color in sterling silver
                </p>
                <p className="text-xl font-semibold text-charcoal">$450</p>
              </div>
            </div>

            {/* Feature Card */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-charcoal">Feature Card</h3>
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-200 border border-warm-grey group cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-opal-electric to-opal-deep flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-serif text-xl font-semibold text-charcoal mb-2">
                  Authenticity Guaranteed
                </h4>
                <p className="text-gray-600">
                  Every opal comes with a certificate of authenticity
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}