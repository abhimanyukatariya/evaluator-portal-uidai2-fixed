// src/app/reviews/page.tsx
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
  // fallback probes:
  listEditions as listChallengeEditions, // /admin/challenges/:id/editions
} from "@/lib/admin_api";

// ------------------------------------------------------------------
// Types & helpers
// ------------------------------------------------------------------
type VmRow = {
  id: string;
  challengeId?: string;
  challengeName?: string;
  challengeSlug?: string;
  startup: string;
  stage: string;
  assignedOn?: string;
  status: "Assigned" | "In Progress" | "Completed";
  editionId: string;
  roundId?: string;
  isPlaceholder?: boolean;
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

function titleCaseSlug(slug?: string) {
  if (!slug) return "—";
  return slug
    .split("-")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

function normalizeApplication(
  a: any,
  editionId: string,
  roundId?: string,
  challengeMeta?: { id?: string; name?: string; slug?: string }
): VmRow {
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

  const assignedOn =
    (pick<string>(
      a.assigned_on,
      a.assignedAt,
      a.created_at,
      a.createdAt
    ) as string) || undefined;

  const status: VmRow["status"] =
    (pick<string>(a.status, a.progress_state) as string) === "COMPLETED"
      ? "Completed"
      : (pick<string>(a.review_status) as string) === "IN_PROGRESS"
      ? "In Progress"
      : "Assigned";

  const stage =
    (pick<string>(a.stage_name, a.round_name, a.stage) as string) || "—";

  const challengeId =
    (challengeMeta?.id as string | undefined) ??
    ((pick<string>(a.challenge_id) as string) ?? undefined);

  const challengeName =
    (challengeMeta?.name as string | undefined) ??
    ((pick<string>(a.challenge_name) as string) ?? undefined);

  const challengeSlug =
    challengeMeta?.slug ?? slugFromChallengeId(challengeId) ?? undefined;

  return {
    id,
    startup,
    stage,
    assignedOn,
    status,
    editionId,
    roundId,
    challengeId,
    challengeName,
    challengeSlug,
  };
}

// Helper to push a placeholder row when we only know an edition (and maybe a round)
function pushPlaceholder(
  into: VmRow[],
  {
    editionId,
    roundId,
    challengeId,
    challengeName,
    challengeSlug,
  }: {
    editionId: string;
    roundId?: string;
    challengeId?: string;
    challengeName?: string;
    challengeSlug?: string;
  }
) {
  into.push({
    id: `placeholder-${editionId}-${roundId ?? "noround"}`,
    startup: "—",
    stage: "—",
    status: "Assigned",
    assignedOn: undefined,
    editionId,
    roundId,
    isPlaceholder: true,
    challengeId,
    challengeName,
    challengeSlug,
  });
}

// ------------------------------------------------------------------
// Page
// ------------------------------------------------------------------
export default async function MyReviewsPage() {
  // 1) Try evaluator-scoped editions
  let evalEditions: any[] = [];
  try {
    const raw = await listEvaluatorEditions(); // /admin/evaluator/editions
    evalEditions = editionsVMFromEvaluator(raw) || [];
  } catch (err) {
    console.error("[reviews] evaluator editions failed:", err);
  }

  // 2) If we got nothing, FALL BACK: probe each known challenge via /admin/challenges/:id/editions
  //    (Your “cohort exists” heuristic.)
  const fallbackAnchors: {
    editionId: string;
    roundId?: string;
    challengeId?: string;
    challengeName?: string;
    challengeSlug?: string;
  }[] = [];

  if (!evalEditions.length) {
    const known = Object.entries(CHALLENGE_ID_MAP); // [slug, challengeId]
    for (const [slug, challengeId] of known) {
      if (!challengeId) continue;
      try {
        const payload = await listChallengeEditions(challengeId); // /admin/challenges/:id/editions
        const editions = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        // If this challenge has at least one edition (e.g., Cohort 1), we treat it as assigned.
        if (editions.length) {
          const first = editions[0];
          const eId = String(first.id ?? first.edition_id ?? "");
          if (eId) {
            fallbackAnchors.push({
              editionId: eId,
              // challenge meta we can show in the table
              challengeId,
              challengeName: titleCaseSlug(slug.replace(/-/g, " ")),
              challengeSlug: slug,
            });
          }
        }
      } catch (err) {
        console.warn(
          "[reviews] fallback challenge editions failed for",
          challengeId,
          err
        );
      }
    }
  }

  // 3) Resolve rounds & applications (for both evaluator editions and fallback anchors)
  const rows: VmRow[] = [];
  let assignedChallengesCount = 0;

  // a) Evaluator editions
  for (const e of evalEditions) {
    const editionId: string = e.id;
    const challengeId: string | undefined = e.challenge_id;
    const challengeSlug: string | undefined =
      e.challenge_slug || slugFromChallengeId(challengeId);
    const challengeName: string | undefined = e.challenge_name;

    assignedChallengesCount += 1;

    let rounds: any[] = [];
    try {
      const rawRounds = await listEvaluatorRounds(editionId);
      rounds = roundsVMFromEvaluator(rawRounds) || [];
    } catch (err) {
      console.warn("[reviews] rounds failed for edition:", editionId, err);
    }

    if (rounds.length) {
      for (const r of rounds) {
        try {
          const apps = await listEvaluatorApplications(r.id);
          for (const a of apps) {
            rows.push(
              normalizeApplication(a, editionId, r.id, {
                id: challengeId,
                name: challengeName,
                slug: challengeSlug,
              })
            );
          }
        } catch (err) {
          console.warn(
            "[reviews] applications failed for round:",
            r.id,
            "edition:",
            editionId,
            err
          );
        }
      }
    }

    // No apps added? add a placeholder row that links to Startups (edition preselected)
    if (!rows.some((r) => r.editionId === editionId)) {
      pushPlaceholder(rows, {
        editionId,
        challengeId,
        challengeName,
        challengeSlug,
      });
    }
  }

  // b) Fallback anchors (if evaluator editions were empty)
  if (!evalEditions.length && fallbackAnchors.length) {
    assignedChallengesCount += fallbackAnchors.length;

    for (const anchor of fallbackAnchors) {
      // We don’t have evaluator rounds here; show a placeholder that goes to Startups
      pushPlaceholder(rows, anchor);
    }
  }

  // 4) Partition rows
  const assignedRows = rows.filter((r) => r.status !== "Completed");
  const completedRows = rows.filter((r) => r.status === "Completed");

  const counts = {
    assigned: assignedChallengesCount,
    completed: completedRows.length,
    total: assignedChallengesCount,
  };

  // 5) Render
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />

        <section className="flex-1">
          {/* Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold">My Reviews</h1>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <div className="text-slate-500">Assigned</div>
                  <div className="text-xl font-semibold">{counts.assigned}</div>
                </div>
                <div>
                  <div className="text-slate-500">Completed</div>
                  <div className="text-xl font-semibold">
                    {counts.completed}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Total</div>
                  <div className="text-xl font-semibold">{counts.total}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="btn btn-primary">Assigned to Me</button>
              <button className="btn btn-outline">Completed</button>
            </div>
          </div>

          {/* Assigned table */}
          <div className="card p-0 overflow-hidden">
            <table className="table w-full">
              <thead>
                <tr className="th">
                  <th className="py-3 px-4 text-left">#</th>
                  <th className="py-3 px-4 text-left">Challenge</th>
                  <th className="py-3 px-4 text-left">Startup</th>
                  <th className="py-3 px-4 text-left">Stage</th>
                  <th className="py-3 px-4 text-left">Assigned On</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedRows.length === 0 ? (
                  <tr className="td">
                    <td className="py-6 px-4 text-center" colSpan={7}>
                      No assigned reviews found.
                    </td>
                  </tr>
                ) : (
                  assignedRows.map((row, i) => {
                    const slug =
                      row.challengeSlug ||
                      (row.challengeName
                        ? row.challengeName.toLowerCase().replace(/\s+/g, "-")
                        : undefined);

                    const challengeLabel =
                      row.challengeName || titleCaseSlug(slug) || "—";

                    const href =
                      row.isPlaceholder && !row.roundId
                        ? {
                            pathname: `/challenge/${
                              slug || "presentation-attack"
                            }/startups`,
                            query: { edition_id: row.editionId },
                          }
                        : {
                            pathname: `/challenge/${
                              slug || "presentation-attack"
                            }/startup/${row.id}/review`,
                            query: {
                              edition_id: row.editionId,
                              ...(row.roundId ? { round_id: row.roundId } : {}),
                            },
                          };

                    return (
                      <tr key={`${row.id}-${i}`} className="td">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{challengeLabel}</td>
                        <td className="py-3 px-4">{row.startup}</td>
                        <td className="py-3 px-4">{row.stage}</td>
                        <td className="py-3 px-4">
                          {row.assignedOn
                            ? new Date(row.assignedOn).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-3 px-4">{row.status}</td>
                        <td className="py-3 px-4">
                          <Link className="btn btn-outline" href={href}>
                            Continue Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Completed */}
          <div className="card p-6 mt-6">
            <h2 className="text-lg font-semibold mb-2">Completed</h2>
            {completedRows.length === 0 ? (
              <p className="text-slate-600">No completed reviews yet.</p>
            ) : (
              <p>Coming soon: render completed rows here.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
