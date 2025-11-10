// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Everything here is public. Adjust as needed.
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/favicon.ico",
  "/icon",        // Next icon route
  "/robots.txt",
  "/sitemap.xml",
  "/_next",       // Next.js internal assets
  "/images",
  "/fonts",
];

function isPublicPath(pathname: string) {
  // Exact match or prefix (e.g., "/_next/static/…")
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value ?? "";

  // 1) Allow all public paths
  if (isPublicPath(pathname)) {
    // If already logged in and hitting /login, push to /landing
    if (pathname === "/login" && token) {
      const url = req.nextUrl.clone();
      url.pathname = "/landing";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2) Everything else requires a cookie
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // preserve where the user was heading
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // 3) Auth OK
  return NextResponse.next();
}

// Run on app routes and APIs, but skip static assets
export const config = {
  matcher: [
    // Exclude Next static/image files and common asset extensions
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
  ],
};
