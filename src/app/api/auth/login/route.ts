// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const ADMIN_API_BASE = process.env.ADMIN_API_BASE ?? "http://13.233.29.114:8090";

export async function POST(req: Request) {
  const body = await req.json(); // { email, password }

  const upstream = await fetch(`${ADMIN_API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({} as any));

  // Try the common token shapes your server may return
  const token =
    data?.token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.accessToken;

  if (!upstream.ok || !token) {
    return NextResponse.json(
      { ok: false, error: data?.message || "Invalid credentials" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  // 7 days; secure in prod; lax is fine for this flow
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
