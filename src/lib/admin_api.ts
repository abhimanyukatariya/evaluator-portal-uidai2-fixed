// src/lib/admin_api.ts
const BASE = process.env.ADMIN_API_BASE!;
const TOKEN = process.env.EVALUATOR_BEARER_TOKEN!;


export async function listApplications(roundId: string) {
  if (!BASE) throw new Error("[admin_api] Missing ADMIN_API_BASE");
  if (!TOKEN) {
    console.warn("[admin_api] Missing EVALUATOR_BEARER_TOKEN; returning empty list.");
    return [];
  }

  const url = `${BASE}/api/evaluator/applications?round_id=${encodeURIComponent(roundId)}`;

  const res = await fetch(url, {
    
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error(`[admin_api] listApplications failed: ${res.status} ${res.statusText}`, txt);
    return [];
  }

  const json = await res.json().catch(() => ({} as any));
  
  const rows = Array.isArray(json?.results) ? json.results : (Array.isArray(json) ? json : []);
  return rows;
}


export async function getApplicationById(id: string) {
  const base = process.env.ADMIN_API_BASE;
  const token = process.env.EVALUATOR_BEARER_TOKEN;

  if (!base) throw new Error("[admin_api] Missing ADMIN_API_BASE");
  if (!token) throw new Error("[admin_api] Missing EVALUATOR_BEARER_TOKEN");

  const url = `${base}/api/applications/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[admin_api] getApplicationById failed:", res.status, text);
    throw new Error(`Failed to fetch application ${id}: ${res.status}`);
  }

  // The API returns a JSON object for a single application
  const data = await res.json();
  return data as Record<string, unknown>;
}
