import { cookies } from 'next/headers'
import { getPayload } from '@/lib/payload'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User } from '@/types/payload-types'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set')
}
const COOKIE_NAME = 'opal-auth'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
}

/**
 * Simple auth utilities using JWT tokens in cookies
 * This is a lightweight alternative to full Payload auth
 */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

export async function createSession(user: AuthUser) {
  const token = createToken(user)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)

  if (!token) return null

  return verifyToken(token.value)
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const payload = await getPayload()

  const users = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email.toLowerCase()
      }
    },
    limit: 1
  })

  return users.docs[0] as User | null
}