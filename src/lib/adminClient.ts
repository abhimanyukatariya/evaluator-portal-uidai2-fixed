// src/lib/adminClient.ts
import { cookies } from "next/headers";

const ADMIN_BASE = process.env.ADMIN_API_BASE || "http://13.233.29.114:8090";

function getTokenFromCookies() {
  const c = cookies();
  const cookie = c.get("EVAL_TOKEN");
  return cookie?.value ?? null;
}

/**
 * Generic fetch to admin API with server cookie token
 */
export async function adminFetch(path: string, opts: RequestInit = {}) {
  const token = getTokenFromCookies();
  const headers: Record<string,string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(opts.headers as Record<string,string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${ADMIN_BASE}${path}`, {
    ...opts,
    headers,
    // set cache policy to no-store for protected, dynamic data:
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Admin API ${res.status}: ${text}`);
    // attach status for calling code
    // @ts-ignore
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** convenience: list applications for a round */
export async function listApplications(round_id: string) {
  return adminFetch(`/api/evaluator/applications?round_id=${encodeURIComponent(round_id)}`);
}


/** convenience: get single application */
export async function getApplication(applicationId: string) {
  return adminFetch(`/api/applications/${encodeURIComponent(applicationId)}`);
}
