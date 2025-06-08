// /Users/itpolaris/AriYudhaPrasetyo/library-dashboard/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public page routes that don't require authentication for viewing
const PUBLIC_PAGE_ROUTES = ["/login", "/register"];

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = ["/api/register"]; // Add other public API routes here if needed

// Root paths that might need special handling if accessed directly
const rootRedirectPaths = ["/", "/admin", "/user"];

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error(
      "CRITICAL: NEXTAUTH_SECRET is not set. Middleware cannot function securely."
    );
    // In a real production scenario, you might want to return a generic error page
    // or prevent access entirely. For now, redirecting to login with an error.
    const errorLoginUrl = new URL("/login", req.url);
    errorLoginUrl.searchParams.set("error", "configuration_error");
    return NextResponse.redirect(errorLoginUrl);
  }

  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  console.log(
    `Middleware: Path: ${pathname}, Method: ${req.method}, Token: ${
      token ? `Exists (User: ${token.email}, Role: ${token.role})` : "No Token"
    }`
  );

  // Allow NextAuth API calls to pass through
  if (pathname.startsWith("/api/auth")) {
    console.log(`Middleware: Allowing NextAuth API route: ${pathname}`);
    return NextResponse.next();
  }

  // Allow public API routes (like /api/register) to pass through
  if (PUBLIC_API_ROUTES.includes(pathname)) {
    console.log(`Middleware: Allowing public API route: ${pathname}`);
    return NextResponse.next(); // This will allow /api/register to proceed
  }



  // Handle public page routes (e.g., /login, /register pages)
  if (PUBLIC_PAGE_ROUTES.includes(pathname)) {
    if (token && (pathname === "/login" || pathname === "/register")) {
      // If an authenticated user tries to access login/register, redirect them to their dashboard
      const redirectUrl =
        token.role === "admin"
          ? new URL("/admin/dashboard", req.url)
          : new URL("/user/beranda", req.url);
      console.log(
        `Middleware: Authenticated user on public page route ${pathname}. Redirecting to ${redirectUrl.pathname}`
      );
      return NextResponse.redirect(redirectUrl);
    }
    console.log(`Middleware: Allowing public page route: ${pathname}`);
    return NextResponse.next();
  }

  // At this point, all other routes require authentication
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    // Preserve the intended destination for redirect after login
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    console.log(
      `Middleware: No token for protected route ${pathname}. Redirecting to login.`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, proceed with role-based access and redirects for authenticated users

  // If authenticated user is on a root redirect path (e.g., '/', '/admin', '/user' directly)
  // send them to their specific dashboard/beranda page.
  if (rootRedirectPaths.includes(pathname)) {
    const redirectUrl =
      token.role === "admin"
        ? new URL("/admin/dashboard", req.url)
        : new URL("/user/beranda", req.url);
    console.log(
      `Middleware: Authenticated user on root path ${pathname}. Redirecting to ${redirectUrl.pathname}`
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based access control for routes starting with /admin or /user
  const isAdminRoute = pathname.startsWith("/admin");
  // const isUserRoute = pathname.startsWith('/user'); // Not strictly needed if admin check is done first

  if (isAdminRoute && token.role !== "admin") {
    console.log(
      `Middleware: Non-admin user (${token.email}) attempting to access admin route ${pathname}. Redirecting to /user/beranda.`
    );
    return NextResponse.redirect(new URL("/user/beranda", req.url)); // Or a dedicated "unauthorized" page
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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
