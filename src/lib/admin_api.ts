// src/lib/admin_api.ts
import { adminFetch } from "./adminClient";

/**
 * NOTE: adminFetch already points at https://api.meity.gov.in/admin
 * so paths below start with `/…` (no extra /admin prefix).
 */

/* ------------------------------------------------------------------ */
/* Challenge id map (extend as you learn more)                        */
/* ------------------------------------------------------------------ */

export const CHALLENGE_ID_MAP: Record<string, string | undefined> = {
  // PAD
  "presentation-attack": "09086248-ce14-44d7-9492-6ffc3d95ba90",
  // Face Liveness
  "face-liveness": "0a9c5363-7795-42e9-895e-05ccd593cb54",
  // "contactless-fingerprint": "<challenge-id-here>",
};

/* ------------------------------------------------------------------ */
/* Small utils                                                         */
/* ------------------------------------------------------------------ */

function toArray<T = any>(maybe: any): T[] {
  if (Array.isArray(maybe)) return maybe as T[];
  if (maybe && Array.isArray(maybe.results)) return maybe.results as T[];
  if (maybe && Array.isArray(maybe.data)) return maybe.data as T[];
  return [];
}

function cleanId(x: any): string {
  const v =
    x?.id ??
    x?.edition_id ??
    x?.editionId ??
    x?.uuid ??
    x?.edition_uuid ??
    x?.round_id ??
    x?.roundId ??
    "";
  return typeof v === "string" ? v : String(v ?? "");
}

function cleanName(x: any): string {
  return (
    x?.name ??
    x?.edition_name ??
    x?.round_name ??
    x?.label ??
    x?.stage ??
    "Untitled"
  );
}

/* ------------------------------------------------------------------ */
/* Challenge-scoped (PM/admin-style)                                  */
/* ------------------------------------------------------------------ */

/** Editions for a challenge */
export async function listEditions(challengeId: string) {
  return adminFetch(`/challenges/${encodeURIComponent(challengeId)}/editions`);
}

/** Rounds (stages) for an edition (evaluator visibility) */
export async function listRoundsByEdition(editionId: string) {
  return adminFetch(`/evaluator/rounds?edition_id=${encodeURIComponent(editionId)}`);
}

/* ---------------------------- VM helpers --------------------------- */

export function editionsVM(payload: any): { id: string; name: string }[] {
  return toArray(payload).map((e: any) => ({
    id: cleanId(e),
    name: String(e?.name ?? e?.edition_name ?? "Edition"),
  }));
}

export function roundsVM(payload: any): { id: string; name: string }[] {
  return toArray(payload).map((r: any) => ({
    id: cleanId(r),
    name: String(r?.name ?? r?.round_name ?? r?.stage ?? "Stage"),
  }));
}

/* ------------------------------------------------------------------ */
/* Evaluator-scoped discovery (cross-challenge)                        */
/* ------------------------------------------------------------------ */

/** Editions visible to the signed-in evaluator */
export async function listEvaluatorEditions() {
  const res = await adminFetch(`/evaluator/editions`);
  return toArray(res);
}

/** Rounds visible to the evaluator for a given edition */
export async function listEvaluatorRounds(editionId: string) {
  // Guard: nothing to query
  if (!editionId || !String(editionId).trim()) return [];

  try {
    const res = await adminFetch(
      `/evaluator/rounds?edition_id=${encodeURIComponent(editionId)}`
    );
    return Array.isArray(res) ? res : res?.results ?? [];
  } catch (err) {
    console.warn("[admin_api] rounds failed for edition:", editionId, err);
    // Don't crash a page render because one edition isn't wired yet
    return [];
  }
}
/** Applications assigned in a given round */
export async function listEvaluatorApplications(roundId: string) {
  const res = await adminFetch(
    `/evaluator/applications?round_id=${encodeURIComponent(roundId)}`
  );
  return toArray(res);
}

/** Defensive mapper for evaluator editions */
export function editionsVMFromEvaluator(arr: any[]) {
  return (arr ?? []).map((e) => ({
    id: cleanId(e),
    name: String(e?.name ?? e?.edition_name ?? "Edition"),
    challenge_id: e?.challenge_id ?? e?.challengeId ?? e?.challenge ?? undefined,
    challenge_slug: e?.challenge_slug ?? e?.challengeSlug ?? undefined,
    challenge_name: e?.challenge_name ?? e?.challengeName ?? e?.challenge ?? undefined,
  }));
}

/** Defensive mapper for evaluator rounds */
export function roundsVMFromEvaluator(arr: any[]) {
  return (arr ?? []).map((r) => ({
    id: cleanId(r),
    name: String(r?.name ?? r?.round_name ?? r?.label ?? r?.stage ?? "Stage"),
  }));
}

/* ------------------------------------------------------------------ */
/* Application detail + scoring                                        */
/* ------------------------------------------------------------------ */

/**
 * Fetch single application detail.
 * Returns either the raw object or `results[0]` if wrapped.
 */
export async function getApplication(appId: string) {
  const res = await adminFetch(`/evaluator/applications/${encodeURIComponent(appId)}`);
  const arr = toArray(res);
  return arr.length ? arr[0] : res ?? null;
}

/** Optional: criteria used for scoring this application */
export async function listScoreCriteria(appId: string) {
  return adminFetch(`/evaluator/applications/${encodeURIComponent(appId)}/criteria`);
}

/** Save evaluator scores */
export async function saveScores(appId: string, payload: any) {
  return adminFetch(`/evaluator/applications/${encodeURIComponent(appId)}/scores`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Aggregate scores by all evaluators (PM view) */
export async function listEvaluatorScores(appId: string) {
  return adminFetch(`/evaluator/applications/${encodeURIComponent(appId)}/scores`);
}


