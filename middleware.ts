// /Users/itpolaris/AriYudhaPrasetyo/library-dashboard/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register']; // Removed /api/auth, will handle pathname.startsWith('/api/auth') directly

// Root paths that might need special handling if accessed directly
const rootRedirectPaths = ['/', '/admin', '/user'];

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("CRITICAL: NEXTAUTH_SECRET is not set. Middleware cannot function securely.");
    // In a real production scenario, you might want to return a generic error page
    // or prevent access entirely. For now, redirecting to login with an error.
    const errorLoginUrl = new URL('/login', req.url);
    errorLoginUrl.searchParams.set('error', 'configuration_error');
    return NextResponse.redirect(errorLoginUrl);
  }

  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  console.log(
    `Middleware: Path: ${pathname}, Token: ${token ? `Exists (User: ${token.email}, Role: ${token.role})` : 'No Token'}`
  );

  // Allow NextAuth API calls to pass through without further checks by this middleware
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Handle public routes (e.g., /login, /register)
  if (publicRoutes.includes(pathname)) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      // If an authenticated user tries to access login/register, redirect them to their dashboard
      const redirectUrl = token.role === 'admin'
        ? new URL('/admin/dashboard', req.url)
        : new URL('/user/beranda', req.url);
      console.log(`Middleware: Authenticated user on public route ${pathname}. Redirecting to ${redirectUrl.pathname}`);
      return NextResponse.redirect(redirectUrl);
    }
    // Allow unauthenticated access to public routes, or authenticated access to other public routes (if any)
    return NextResponse.next();
  }

  // At this point, all other routes require authentication
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    // Preserve the intended destination for redirect after login
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href);
    console.log(`Middleware: No token for protected route ${pathname}. Redirecting to login.`);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, proceed with role-based access and redirects for authenticated users

  // If authenticated user is on a root redirect path (e.g., '/', '/admin', '/user' directly)
  // send them to their specific dashboard/beranda page.
  if (rootRedirectPaths.includes(pathname)) {
    const redirectUrl = token.role === 'admin'
      ? new URL('/admin/dashboard', req.url)
      : new URL('/user/beranda', req.url);
    console.log(`Middleware: Authenticated user on root path ${pathname}. Redirecting to ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for routes starting with /admin or /user
  const isAdminRoute = pathname.startsWith('/admin');
  // const isUserRoute = pathname.startsWith('/user'); // Not strictly needed if admin check is done first

  if (isAdminRoute && token.role !== 'admin') {
    console.log(`Middleware: Non-admin user (${token.email}) attempting to access admin route ${pathname}. Redirecting to /user/beranda.`);
    return NextResponse.redirect(new URL('/user/beranda', req.url)); // Or a dedicated "unauthorized" page
  }

  // Optional: If an admin tries to access a general user-only page (e.g. /user/settings if /admin has its own settings)
  // This depends on your application's structure. For now, admins are allowed on /user/* routes if not an admin-only route.
  // if (isUserRoute && token.role === 'admin' && !pathname.startsWith('/admin')) { // Example condition
  //   console.log(`Middleware: Admin user on general user route ${pathname}. Redirecting to admin dashboard.`);
  //   return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  // }

  // If all checks pass (e.g., user on /user/beranda with 'user' role, or admin on /admin/dashboard with 'admin' role)
  console.log(`Middleware: Access granted for ${token.email} to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This ensures middleware runs on relevant pages and NextAuth's own /api/auth routes (handled by early return),
     * but doesn't interfere with static assets.
     * Other API routes (e.g. /api/data) would also be matched if not excluded here or handled specifically.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};