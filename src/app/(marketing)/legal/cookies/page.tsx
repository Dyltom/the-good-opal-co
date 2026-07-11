import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { MarketingShell } from '@/components/marketing'
import { CONTACT_INFO } from '@/lib/constants/contact'

export const metadata: Metadata = {
  title: 'Cookie Policy | The Good Opal Co',
  description: 'Learn about how The Good Opal Co uses cookies and similar technologies on our website.',
  alternates: { canonical: '/legal/cookies' },
}

export default function CookiePolicyPage() {
  const lastUpdated = new Date('2026-07-11').toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <MarketingShell mainClassName="bg-white">
      <Container className="py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cookie Policy' },
          ]}
          className="mb-8"
        />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display font-bold text-charcoal mb-4">
            Cookie Policy
          </h1>
          <p className="text-content-muted mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-content mb-4">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and provide information to website owners.
              </p>
              <p className="text-content mb-4">
                The Good Opal Co uses cookies and similar technologies to enhance your shopping experience, analyze website traffic, and personalize content.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                2. How We Use Cookies
              </h2>
              <p className="text-content mb-4">
                We use cookies for the following purposes:
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.1 Essential Cookies
              </h3>
              <p className="text-content mb-4">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Shopping Cart:</strong> Remember items in your cart</li>
                <li><strong>Authentication:</strong> Keep you logged in to your account</li>
                <li><strong>Security:</strong> Protect against cross-site request forgery</li>
                <li><strong>Load Balancing:</strong> Ensure website stability</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.2 Performance Cookies
              </h3>
              <p className="text-content mb-4">
                These cookies collect information about how visitors use our website, such as which pages are visited most often. This helps us improve our website&apos;s performance.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Vercel Analytics:</strong> Website performance monitoring</li>
                <li><strong>Google Analytics:</strong> Visitor behavior analysis</li>
                <li><strong>Error Tracking:</strong> Identify and fix website issues</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.3 Functional Cookies
              </h3>
              <p className="text-content mb-4">
                These cookies enable personalized features and remember your preferences.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Language Preferences:</strong> Remember your language choice</li>
                <li><strong>Currency Settings:</strong> Display prices in your preferred currency</li>
                <li><strong>Recently Viewed:</strong> Show products you&apos;ve looked at</li>
                <li><strong>Wishlist:</strong> Save items for later</li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                2.4 Marketing Cookies
              </h3>
              <p className="text-content mb-4">
                These cookies track your browsing habits to deliver relevant advertisements and measure the effectiveness of our marketing campaigns.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Facebook Pixel:</strong> Social media advertising</li>
                <li><strong>Google Ads:</strong> Search and display advertising</li>
                <li><strong>Remarketing:</strong> Show relevant ads on other websites</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                3. Types of Data Collected
              </h2>
              <p className="text-content mb-4">
                Cookies may collect and store the following information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Referring website</li>
                <li>Pages visited and time spent</li>
                <li>Links clicked</li>
                <li>Products viewed and purchased</li>
                <li>Search queries on our site</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                4. Cookie List
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Cookie Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal border-b">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm">cart</td>
                      <td className="px-4 py-3 text-sm">Essential</td>
                      <td className="px-4 py-3 text-sm">7 days</td>
                      <td className="px-4 py-3 text-sm">Stores shopping cart items</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">session_id</td>
                      <td className="px-4 py-3 text-sm">Essential</td>
                      <td className="px-4 py-3 text-sm">Session</td>
                      <td className="px-4 py-3 text-sm">Maintains user session</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">_ga</td>
                      <td className="px-4 py-3 text-sm">Performance</td>
                      <td className="px-4 py-3 text-sm">2 years</td>
                      <td className="px-4 py-3 text-sm">Google Analytics tracking</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">_fbp</td>
                      <td className="px-4 py-3 text-sm">Marketing</td>
                      <td className="px-4 py-3 text-sm">3 months</td>
                      <td className="px-4 py-3 text-sm">Facebook advertising</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">preferences</td>
                      <td className="px-4 py-3 text-sm">Functional</td>
                      <td className="px-4 py-3 text-sm">1 year</td>
                      <td className="px-4 py-3 text-sm">User preferences (theme, currency)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">recently_viewed</td>
                      <td className="px-4 py-3 text-sm">Functional</td>
                      <td className="px-4 py-3 text-sm">30 days</td>
                      <td className="px-4 py-3 text-sm">Recently viewed products</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                5. Third-Party Cookies
              </h2>
              <p className="text-content mb-4">
                Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Third-party providers include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> Website analytics service</li>
                <li><strong>Facebook:</strong> Social media integration and advertising</li>
                <li><strong>Stripe:</strong> Payment processing (essential for checkout)</li>
                <li><strong>Vercel:</strong> Website hosting and analytics</li>
              </ul>
              <p className="text-content mb-4">
                These providers have their own privacy policies and may use the data collected for their own purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                6. Managing Cookies
              </h2>
              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.1 Cookie Settings
              </h3>
              <p className="text-content mb-4">
                When you first visit our website, you&apos;ll see a cookie consent banner that allows you to accept or reject non-essential cookies. You can change your preferences at any time by clicking the &quot;Cookie Settings&quot; link in the footer.
              </p>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.2 Browser Settings
              </h3>
              <p className="text-content mb-4">
                Most web browsers allow you to control cookies through their settings:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><a href="https://support.google.com/chrome/answer/95647" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Edge</a></li>
              </ul>

              <h3 className="text-xl font-medium text-charcoal mb-3">
                6.3 Consequences of Disabling Cookies
              </h3>
              <p className="text-content mb-4">
                If you disable or reject cookies, some features of our website may not function properly:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Shopping cart may not remember your items</li>
                <li>You may need to log in repeatedly</li>
                <li>Personalized recommendations won&apos;t be available</li>
                <li>Some pages may not display correctly</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                7. Do Not Track
              </h2>
              <p className="text-content mb-4">
                Some browsers have a &quot;Do Not Track&quot; feature that lets you tell websites you don&apos;t want your online activities tracked. Our website currently does not respond to Do Not Track signals, but you can manage tracking through our cookie settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p className="text-content mb-4">
                Our website is not intended for children under 16. We do not knowingly collect data from or market to children under 16 years of age.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-content mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, law, or our business operations. We will notify you of any material changes by updating the date at the top of this policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                10. Contact Us
              </h2>
              <p className="text-content mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-charcoal mb-2">The Good Opal Co</p>
                <p className="text-content">Email: {CONTACT_INFO.privacyEmail}</p>
                <p className="text-content">Phone: +61 2 9555 1234</p>
                <p className="text-content">Address: Sydney, NSW, Australia</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-charcoal mb-4">
                11. More Information
              </h2>
              <p className="text-content mb-4">
                For more information about cookies and how they work, visit:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="https://www.allaboutcookies.org" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
                <li><a href="https://www.youronlinechoices.com.au" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Your Online Choices Australia</a></li>
                <li><a href="https://www.oaic.gov.au" className="text-opal-electric-accessible hover:underline" target="_blank" rel="noopener noreferrer">Office of the Australian Information Commissioner</a></li>
              </ul>
            </section>
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
