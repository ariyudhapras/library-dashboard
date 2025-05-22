import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Server-side route for clearing all cookies
export async function GET() {
  // Get all cookies
  const cookieStore = cookies()
  
  // Explicitly delete all authentication-related cookies
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.includes('next-auth') || cookie.name.includes('session')) {
      cookieStore.delete(cookie.name)
    }
  })
  
  // Redirect to login page
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
} 