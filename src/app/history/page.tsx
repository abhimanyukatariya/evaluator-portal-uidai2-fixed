// src/app/history/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

import {
  listEvaluatorEditions,
  listEvaluatorRounds,
  listEvaluatorApplications,
  editionsVMFromEvaluator,
  roundsVMFromEvaluator,
  CHALLENGE_ID_MAP,
} from "@/lib/admin_api";

// ---------- helpers ----------------------------------------------------------

type VmRow = {
  id: string;            // application id
  startup: string;
  challengeName?: string;
  challengeSlug?: string;
  stage?: string;
  submittedOn?: string;
};

function pick<T = string>(...vals: any[]): T | "" {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== "") return v as T;
  }
  return "" as T;
}

function slugFromChallengeId(id?: string): string | undefined {
  if (!id) return undefined;
  for (const [slug, cid] of Object.entries(CHALLENGE_ID_MAP)) {
    if (cid === id) return slug;
  }
  return undefined;
}

function normalizeResults(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/** Decide if an application is SUBMITTED (robust to API shape differences). */
function isSubmitted(a: any): boolean {
  const reviewStatus = String(pick(a.review_status)).toUpperCase();
  const status = String(pick(a.status)).toUpperCase();
  const submissionStatus = String(pick(a.submission_status)).toUpperCase();

  // common values we’ve seen
  if (reviewStatus === "SUBMITTED") return true;
  if (status === "COMPLETED" || status === "SUBMITTED" || status === "FINALIZED") return true;
  if (submissionStatus === "SUBMITTED" || submissionStatus === "COMPLETED") return true;

  // boolean flags some APIs emit
  const flags = [a.is_submitted, a.submitted, a.finalized];
  if (flags.some((f) => f === true || f === "true" || f === 1 || f === "1")) return true;

  return false;
}

function normalizeRow(a: any, edition: any, round: any): VmRow {
  const id = String(pick(a.application_id, a.id, a.startup_id, a.user_id) || "");
  const startup =
    (pick<string>(
      a.startup_name,
      a.companyname,
      a.company_name,
      a.companyName,
      a.name,
      a.startup
    ) as string) || "—";

  const stage = (pick<string>(a.stage_name, a.round_name, a.stage) as string) || "—";
  const submittedOn =
    (pick<string>(a.submitted_on, a.submittedAt, a.updated_at, a.updatedAt, a.created_at) as
      | string
      | "") || undefined;

  const challengeId = edition?.challenge_id;
  const challengeName = edition?.challenge_name || (pick<string>(a.challenge_name) as string) || undefined;
  const challengeSlug = edition?.challenge_slug || slugFromChallengeId(challengeId);

  return { id, startup, challengeName, challengeSlug, stage, submittedOn };
}

// ---------- page -------------------------------------------------------------

export default async function HistoryPage() {
  // 1) Editions available to this evaluator
  const editions = editionsVMFromEvaluator(await listEvaluatorEditions());

  // 2) For each edition, fetch rounds
  const validEditions = (editions ?? []).filter(
  (e: any) => e && typeof e.id === "string" && e.id.trim() !== ""
);

const editionWithRounds = await Promise.all(
  validEditions.map(async (e: any) => {
    // listEvaluatorRounds already guards & swallows 500s
    const rounds = await listEvaluatorRounds(e.id);
    return { edition: e, rounds };
  })
);

  // 3) For each round, fetch applications and keep ONLY submitted
  const rows: VmRow[] = [];
  for (const item of editionWithRounds) {
    for (const r of item.rounds) {
      try {
        const raw = await listEvaluatorApplications(r.id);
        const apps = normalizeResults(raw);
        for (const a of apps) {
          if (isSubmitted(a)) {
            rows.push(normalizeRow(a, item.edition, r));
          }
        }
      } catch (e) {
        console.warn("[history] apps fetch failed for round", r.id, e);
      }
    }
  }

  // Sort newest first (if submittedOn exists)
  rows.sort((a, b) => {
    const ta = a.submittedOn ? Date.parse(a.submittedOn) : 0;
    const tb = b.submittedOn ? Date.parse(b.submittedOn) : 0;
    return tb - ta;
  });

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />

        <section className="flex-1">
          <div className="card p-6 mb-6">
            <h1 className="text-xl md:text-2xl font-semibold">History</h1>
            <p className="text-slate-600 mt-1">
              Only applications you <span className="font-medium">submitted</span> are listed here.
            </p>
          </div>

          <div className="card p-0 overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr className="th">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Challenge</th>
                  <th className="py-3 px-4 text-left">Startup</th>
                  <th className="py-3 px-4 text-left">Stage</th>
                  <th className="py-3 px-4 text-left">Submitted On</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className="td">
                    <td className="py-6 px-4 text-center" colSpan={6}>
                      No submitted reviews yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => {
                    const challengeLabel =
                      row.challengeName ||
                      (row.challengeSlug
                        ? row.challengeSlug
                            .split("-")
                            .map((s) => s[0]?.toUpperCase() + s.slice(1))
                            .join(" ")
                        : "—");

                    // Read-only view route (to your existing Application details page)
                    const viewHref = {
    pathname: "/challenge/[slug]/startup/[id]" as const,
    query: {
      slug: row.challengeSlug ?? "presentation-attack",
      id: row.id,
    },
  };

                    return (
                      <tr key={`${row.id}-${i}`} className="td">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{challengeLabel}</td>
                        <td className="py-3 px-4">{row.startup}</td>
                        <td className="py-3 px-4">{row.stage || "—"}</td>
                        <td className="py-3 px-4">
                          {row.submittedOn ? new Date(row.submittedOn).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Link className="btn btn-outline" href={viewHref}>
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>  
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
