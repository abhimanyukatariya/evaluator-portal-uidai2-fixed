// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const ADMIN_API_BASE = process.env.ADMIN_API_BASE ?? "https://api.meity.gov.in/admin";

const ADMIN_LOGIN_PATH = process.env.ADMIN_LOGIN_PATH ?? "/login";


export async function POST(req: Request) {
  const body = await req.json(); 

  const upstream = await fetch(`${ADMIN_API_BASE}${ADMIN_LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  
  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: `Admin login failed (${upstream.status})`, details: text.slice(0, 300) },
      { status: 401 }
    );
  }

  const data = await upstream.json().catch(() => ({} as any));
  
  const token =
    data?.token ??
    data?.access_token ??
    data?.jwt ??
    data?.data?.token ??
    "";

  if (!token) {
    return NextResponse.json({ error: "No token returned from server." }, { status: 401 });
  }

  return NextResponse.json({ token });
}
