import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register']

// Root paths to be intercepted for redirection
const rootPaths = ['/', '/admin', '/user']

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    console.log(`Middleware processing ${path}`, 
      token ? `User: ${token.email}, Role: ${token.role}` : 'No token')
    
    // Handle root path redirection based on authentication status
    if (rootPaths.includes(path) || path === '/') {
      if (token) {
        // Redirect based on user role
        if (token.role === 'admin') {
          console.log('Redirecting admin to dashboard')
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        } else {
          console.log('Redirecting user to beranda')
          return NextResponse.redirect(new URL('/user/beranda', req.url))
        }
      } else {
        // Not authenticated, redirect to login
        console.log('Not authenticated, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }
    
    // Allow access to public routes without authentication
    if (publicRoutes.includes(path)) {
      // If user is already authenticated and trying to access login page
      if (token && path === '/login') {
        // Redirect based on user role
        if (token.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        } else {
          return NextResponse.redirect(new URL('/user/beranda', req.url))
        }
      }
      
      return NextResponse.next()
    }
    
    // From here on, all routes require authentication
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Check if user is trying to access an admin route
    const isAdminRoute = path.startsWith('/admin')
    // Check if user is trying to access a user route
    const isUserRoute = path.startsWith('/user')
    
    // Redirect admin users trying to access user routes to admin dashboard
    if (isUserRoute && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    
    // Redirect regular users trying to access admin routes to user beranda
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/user/beranda', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes without authentication
        const path = req.nextUrl.pathname
        if (publicRoutes.includes(path) || rootPaths.includes(path)) {
          return true
        }
        
        // All other routes require authentication
        return !!token
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    "/admin",
    "/admin/:path*",
    "/user",
    "/user/:path*",
    "/books/:path*",
    "/members/:path*",
    "/reports/:path*",
    "/requests/:path*",
    "/returns/:path*",
    "/peminjaman/:path*",
    "/riwayat/:path*",
    "/profile",
    "/profile/:path*",
  ]
} 