'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormState } from 'react-dom'
import { login, register } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading] = useState(false)
  const [loginState, loginAction] = useFormState(login, null)
  const [registerState, registerAction] = useFormState(register, null)

  const action = isRegister ? registerAction : loginAction

  const error = isRegister ? registerState?.error : loginState?.error

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Toggle between login and register */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
        <button
          type="button"
          onClick={() => setIsRegister(false)}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            !isRegister
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-600 hover:text-charcoal'
          )}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setIsRegister(true)}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
            isRegister
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-600 hover:text-charcoal'
          )}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* Name field (register only) */}
        {isRegister && (
          <div>
            <Label htmlFor="name" className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-400" />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Smith"
              className="h-12"
              autoComplete="name"
            />
          </div>
        )}

        {/* Email field */}
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-gray-400" />
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="h-12"
            autoComplete="email"
          />
        </div>

        {/* Phone field (register only, optional) */}
        {isRegister && (
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-gray-400" />
              Phone Number
              <span className="text-xs text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+61 400 000 000"
              className="h-12"
              autoComplete="tel"
            />
          </div>
        )}

        {/* Password field */}
        <div>
          <Label htmlFor="password" className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-gray-400" />
            Password
            {isRegister && (
              <span className="text-xs text-gray-500">(Min 8 characters)</span>
            )}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="h-12"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={8}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isRegister ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            <>{isRegister ? 'Create Account' : 'Sign In'}</>
          )}
        </Button>

        {/* Alternative actions */}
        {!isRegister && (
          <p className="text-center text-sm text-gray-600">
            <Link
              href="/account/forgot-password"
              className="text-opal-electric-accessible hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
        )}

        {/* Guest checkout reminder */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Looking for an order?{' '}
            <Link
              href="/order-tracking"
              className="text-opal-electric-accessible hover:underline"
            >
              Track as guest
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}