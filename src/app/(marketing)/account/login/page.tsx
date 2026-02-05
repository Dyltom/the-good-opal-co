import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { LoginForm } from './login-form'
import { getSession } from '@/lib/auth-simple'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Login | The Good Opal Co',
  description: 'Access your account to view orders and manage preferences',
}

export default async function LoginPage() {
  // Redirect if already logged in
  const session = await getSession()
  if (session) {
    redirect('/account')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Account Login' },
          ]}
          className="mb-8"
        />

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
              Welcome Back
            </h1>
            <p className="text-content">
              Sign in to access your account and order history
            </p>
          </div>

          <LoginForm />
        </div>
      </Container>
    </div>
  )
}