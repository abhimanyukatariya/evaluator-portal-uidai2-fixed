// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const isAuth = Boolean(token);
  const { pathname } = req.nextUrl;

  const isLogin = pathname.startsWith("/login");
  const isRoot = pathname === "/";
  const protectedPrefixes = [
    "/landing",
    "/challenge",
    "/analytics",
    "/history",
    "/evaluations",
    "/Profile",
  ];
  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));

  // Hit root: decide where to go
  if (isRoot) {
    return NextResponse.redirect(new URL(isAuth ? "/landing" : "/login", req.url));
  }

  // Already logged in but opening /login → push to landing
  if (isAuth && isLogin) {
    return NextResponse.redirect(new URL("/landing", req.url));
  }

  // Not logged in, trying to view protected pages → go to login
  if (!isAuth && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/landing",
    "/challenge/:path*",
    "/analytics",
    "/history",
    "/evaluations",
    "/Profile",
  ],
};
