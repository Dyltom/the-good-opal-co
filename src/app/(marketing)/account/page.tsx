import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth-simple'
import { getPayload } from '@/lib/payload'
import { Package, User, MapPin, Heart, LogOut, ChevronRight } from 'lucide-react'
import { logout } from './actions'

export const metadata: Metadata = {
  title: 'My Account | The Good Opal Co',
  description: 'Manage your account, view orders, and update preferences',
}

export default async function AccountPage() {
  const session = await getSession()

  // Require authentication
  if (!session) {
    redirect('/account/login')
  }

  const payload = await getPayload()

  // Get user's orders
  const orders = await payload.find({
    collection: 'orders',
    where: {
      'customer.email': {
        equals: session.email
      }
    },
    sort: '-createdAt',
    limit: 5
  })

  // Get customer record
  const customers = await payload.find({
    collection: 'customers',
    where: {
      email: {
        equals: session.email
      }
    },
    limit: 1
  })

  const customer = customers.docs[0]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Account' },
          ]}
          className="mb-8"
        />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
            Welcome back, {session.name || 'Opal Lover'}!
          </h1>
          <p className="text-content">
            Manage your account and track your orders
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-charcoal mb-6">Account Menu</h2>
              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-charcoal font-medium"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    Dashboard
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/account/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    Order History
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/account/addresses"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/account/wishlist"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5" />
                    Wishlist
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <form action={logout} className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start text-gray-700"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </form>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-charcoal mb-6">Account Overview</h2>

              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-opal-electric">
                    {customer?.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-fire-pink">
                    ${((customer?.totalSpent || 0) / 100).toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-opal-emerald">
                    {customer?.subscribedToNewsletter ? '✓' : '✗'}
                  </p>
                  <p className="text-sm text-gray-600">Newsletter</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-charcoal">{session.email}</p>
                </div>
                {customer?.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-charcoal">{customer.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-charcoal">Recent Orders</h2>
                {orders.totalDocs > 0 && (
                  <Link
                    href="/account/orders"
                    className="text-sm text-opal-electric-accessible hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>

              {orders.totalDocs === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <Button asChild>
                    <Link href="/store">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.docs.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.orderNumber}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-opal-electric transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-charcoal">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-AU')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-charcoal">
                            ${(order.total / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}