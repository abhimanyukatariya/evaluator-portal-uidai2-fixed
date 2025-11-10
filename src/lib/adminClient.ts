// src/lib/adminClient.ts
'use server';
import 'server-only';

const BASE =
  process.env.ADMIN_API_BASE ?? 'https://api.meity.gov.in/admin';

/**
 * Server-side fetch wrapper for the Admin API.
 * - Tries to pick up the auth token from App Router cookies at runtime.
 * - Falls back to EVALUATOR_BEARER_TOKEN (useful locally / during builds).
 * - Never cached.
 */
export async function adminFetch(
  path: string,
  init: RequestInit = {}
) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`;
  const headers = new Headers(init.headers as HeadersInit);

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Try to read the cookie token only at runtime (App Router server).
  let token: string | undefined;
  try {
    const mod = await import('next/headers'); // dynamic -> safe for pages build
    token = mod.cookies().get('auth_token')?.value;
  } catch {
    // Not in App Router server (e.g. pages build / API route) – use env token
    token = process.env.EVALUATOR_BEARER_TOKEN;
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `[adminFetch] ${res.status} ${res.statusText} for ${url}: ${text}`
    );
  }

  try {
    return await res.json();
  } catch {
    return {};
  }
}
