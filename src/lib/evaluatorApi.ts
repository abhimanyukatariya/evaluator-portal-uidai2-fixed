const API_BASE = process.env.ADMIN_API_BASE!;
const ROUND_ID = process.env.EVALUATOR_ROUND_ID!;
const TOKEN = process.env.EVALUATOR_BEARER_TOKEN!;

type AnyJson = any;

/** Return a guaranteed array of rows from whatever the backend sends */
function normalizeRows(payload: AnyJson): AnyJson[] {
  if (Array.isArray(payload)) return payload;
  if (payload == null) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  // some APIs nest deeper: {data:{items:[...]}}
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  // fallback: single object -> wrap in array
  if (typeof payload === "object") return [payload];
  return [];
}

export async function fetchEvaluatorApplications() {
  const url = `${API_BASE}/api/evaluator/applications?round_id=${ROUND_ID}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Evaluator API failed:", res.status, text);
    throw new Error(`Failed to fetch evaluator applications: ${res.status}`);
  }

  const json = await res.json().catch(() => null);
  return normalizeRows(json);
}
