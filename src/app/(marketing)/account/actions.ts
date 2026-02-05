'use server'

import { z } from 'zod'
import { getPayload } from '@/lib/payload'
import { createSession, destroySession, hashPassword, verifyPassword, getUserByEmail } from '@/lib/auth-simple'
import { redirect } from 'next/navigation'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional()
})

export async function login(formData: FormData) {
  try {
    const data = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password')
    })

    // Find user
    const user = await getUserByEmail(data.email)
    if (!user) {
      return { error: 'Invalid email or password' }
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.password)
    if (!isValid) {
      return { error: 'Invalid email or password' }
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role || undefined
    })

    redirect('/account')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    throw error // Let redirect throw
  }
}

export async function register(formData: FormData) {
  try {
    const data = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      phone: formData.get('phone') || undefined
    })

    const payload = await getPayload()

    // Check if user exists
    const existing = await getUserByEmail(data.email)
    if (existing) {
      return { error: 'Email already registered' }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create user
    const user = await payload.create({
      collection: 'users',
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: 'customer'
      }
    })

    // Also create/link customer record for CRM
    const customers = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: data.email.toLowerCase()
        }
      },
      limit: 1
    })

    if (customers.docs.length === 0) {
      await payload.create({
        collection: 'customers',
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          phone: data.phone,
          source: 'registration',
          subscribedToNewsletter: false,
          emailVerified: false
        }
      })
    }

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role || undefined
    })

    redirect('/account')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' }
    }
    throw error // Let redirect throw
  }
}

export async function logout() {
  await destroySession()
  redirect('/')
}