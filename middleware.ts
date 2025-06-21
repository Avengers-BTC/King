import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public routes
    if (path === "/" || path.startsWith("/login") || path.startsWith("/signup")) {
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }    // Role-based access control
    if (path.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect DJs to their dashboard
    if (token.role === "DJ" && path === "/dashboard") {
      return NextResponse.redirect(new URL("/dj/dashboard", req.url));
    }

    // Protect DJ routes
    if (path.startsWith("/dj/") && token.role !== "DJ") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/clubs/manage") && token.role !== "CLUB_OWNER") {
      return NextResponse.redirect(new URL("/clubs", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
  ],
}; 
