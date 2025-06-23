import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Debug log for authentication issues
    console.log(`[Middleware] Processing ${path} | Auth:`, !!token, "| Role:", token?.role);

    // Public routes - always allow these
    const publicRoutes = ["/", "/login", "/signup", "/api/auth", "/api/health"];
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
    
    if (isPublicRoute) {
      // If user is already authenticated and trying to access login/signup, redirect appropriately
      if (token && (path === "/login" || path === "/signup")) {
        console.log("[Middleware] Already authenticated, redirecting from auth pages");
        if (token.role === "DJ") {
          return NextResponse.redirect(new URL("/dj/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Check if user is authenticated for protected routes
    if (!token) {
      console.log("[Middleware] Unauthorized access attempt to:", path);
      
      // Store the attempted URL to redirect back after login
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, req.url);
      
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (path.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      console.log("[Middleware] Admin access denied for role:", token.role);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect DJs to their dashboard if they access the general dashboard
    if (token.role === "DJ" && path === "/dashboard") {
      console.log("[Middleware] Redirecting DJ to DJ dashboard");
      return NextResponse.redirect(new URL("/dj/dashboard", req.url));
    }

    // Protect DJ routes
    if (path.startsWith("/dj/") && token.role !== "DJ") {
      console.log("[Middleware] DJ route access denied for role:", token.role);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Protect club management routes
    if (path.startsWith("/clubs/manage") && token.role !== "CLUB_OWNER") {
      console.log("[Middleware] Club management access denied for role:", token.role);
      return NextResponse.redirect(new URL("/clubs", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Always allow public routes
        const publicRoutes = ["/", "/login", "/signup", "/api/auth", "/api/health"];
        const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
        
        if (isPublicRoute) {
          return true;
        }
        
        // For protected routes, require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/djs/:path*",
    "/dj/:path*",
    "/chat/:path*",
    "/clubs/manage/:path*",
    "/moments/upload",
    "/login",
    "/signup",
  ],
}; 
