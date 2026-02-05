import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth-simple'

export async function POST() {
  await destroySession()

  // Redirect to home page after logout
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:8412'))
}