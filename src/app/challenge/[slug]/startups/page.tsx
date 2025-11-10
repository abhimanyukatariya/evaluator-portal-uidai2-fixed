// src/app/challenge/[slug]/startups/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

import {
  CHALLENGE_ID_MAP,
  // PAD (challenge-scoped)
  listEditions,
  listRoundsByEdition,
  editionsVM,
  roundsVM,
  // Evaluator-scoped (fallback)
  listEvaluatorEditions,
  listEvaluatorRounds,
  listEvaluatorApplications,
  editionsVMFromEvaluator,
  roundsVMFromEvaluator,
} from "@/lib/admin_api";

type Params = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

type ApiRow = Record<string, any>;
type VmRow = {
  id: string | undefined;
  name: string;
  location: string;
  stage: string;
  status: string;
};

function pick<T = string>(...vals: any[]): T | "" {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== "") return v as T;
  }
  return "" as T;
}

function normalizeRows(arr: ApiRow[]): VmRow[] {
  return (arr ?? []).map((r) => {
    const id = pick<string>(r.startup_id, r.id, r.user_id);
    const name =
      pick<string>(
        r.startup_name,
        r.companyname,
        r.company_name,
        r.companyName,
        r.name,
        r.namew,
        r.startup
      ) || "—";
    const location = pick<string>(r.location, r.city, r.cityc, r.statec, r.state) || "—";
    const stage = pick<string>(r.stage, r.stagec) || "—";
    const status = pick<string>(r.status, r.progress_state) || "—";
    return { id, name, location, stage, status };
  });
}

export default async function StartupsPage({ params, searchParams }: Params) {
  const { slug } = params;

  // ---- query
  const selectedEdition =
    (typeof searchParams.edition_id === "string" && searchParams.edition_id) || "";
  const selectedRound =
    (typeof searchParams.round_id === "string" && searchParams.round_id) || "";

  // ---------- Editions ----------
  const challengeId = CHALLENGE_ID_MAP[slug];
  let editions: { id: string; name: string }[] = [];

  // Try challenge-scoped editions (PAD) first
  if (challengeId) {
    try {
      const raw = await listEditions(challengeId);
      editions = editionsVM(raw);
    } catch (e) {
      console.error("[editions/challenge] failed:", e);
    }
  }

  // If none (or no mapping for this slug), fallback to evaluator editions
  if (editions.length === 0) {
    try {
      const allEval = editionsVMFromEvaluator(await listEvaluatorEditions());

      // If API returns challenge hints, filter them to this slug; otherwise keep all
      const normalizedSlug = slug.replace(/\s+/g, "-").toLowerCase();
      const filtered = allEval.filter((e: any) => {
        const bySlug =
          (e.challenge_slug &&
            String(e.challenge_slug).toLowerCase() === normalizedSlug) ||
          (e.challenge_name &&
            String(e.challenge_name)
              .toLowerCase()
              .includes(normalizedSlug.replace(/-/g, " ")));
        return bySlug || (!e.challenge_slug && !e.challenge_name);
      });

      editions = (filtered.length ? filtered : allEval).map((e: any) => ({
        id: e.id,
        name: e.name,
      }));
    } catch (e) {
      console.error("[editions/evaluator] failed:", e);
    }
  }

  // ---------- Rounds / Stages ----------
  let rounds: { id: string; name: string }[] = [];

  if (selectedEdition) {
    // Try challenge-scoped rounds (PAD)
    try {
      const raw = await listRoundsByEdition(selectedEdition);
      rounds = roundsVM(raw);
    } catch {
      // ignore and try evaluator
    }

    if (rounds.length === 0) {
      try {
        const rawEval = await listEvaluatorRounds(selectedEdition);
        rounds = roundsVMFromEvaluator(rawEval);
      } catch (e) {
        console.error("[rounds/evaluator] failed:", e);
      }
    }
  }

  // ---------- Applications (only when both edition & round are set) ----------
  let rows: VmRow[] = [];
  if (selectedEdition && selectedRound) {
    try {
      const payload: any = await listEvaluatorApplications(String(selectedRound));
      const raw: ApiRow[] = Array.isArray(payload) ? payload : payload?.results ?? [];
      rows = normalizeRows(raw);
    } catch (err) {
      console.error("[startups] failed to load applications:", err);
    }
  }

  const titleLabel = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen flex">
      {/* Left nav */}
      <aside className="hidden md:block w-64 border-r bg-white/60">
        <Sidebar />
      </aside>

      <section className="flex-1 p-4 md:p-8 space-y-6">
        <Header title={`Startups — ${titleLabel}`} showBack />

        {/* Editions */}
        <div className="card p-5 space-y-2">
          <div className="font-semibold">Editions</div>
          <div className="max-w-3xl">
            {await import("./EditionsPicker").then(({ default: EditionsPicker }) => (
              <EditionsPicker editions={editions} slug={slug} />
            ))}
          </div>
          {!challengeId && (
            <p className="text-xs text-amber-600">
              This challenge slug is not mapped to a specific challenge id. Falling back
              to evaluator editions.
            </p>
          )}
        </div>

        {/* Stages */}
        <div className="card p-5 space-y-3">
          <div className="font-semibold">Stage</div>
          {selectedEdition ? (
            rounds.length ? (
              <div className="flex flex-wrap gap-2">
                {rounds.map((r) => {
                  const active = r.id === selectedRound;
                  return (
                    <Link
                      key={r.id}
                      href={{
                        pathname: `/challenge/${slug}/startups`,
                        query: { edition_id: selectedEdition, round_id: r.id },
                      }}
                      className={`px-3 py-1 rounded-full border ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      {r.name}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500">No stages found for this edition.</p>
            )
          ) : (
            <p className="text-slate-500">Select an edition to view stages.</p>
          )}
        </div>

        {/* Applications */}
        <div className="card p-6 overflow-x-auto">
          {selectedEdition && selectedRound ? (
            <table className="table w-full">
              <thead>
                <tr className="th">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Company</th>
                  <th className="py-2 px-3 text-left">Location</th>
                  <th className="py-2 px-3 text-left">Stage</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className="td">
                    <td className="py-4 px-3 text-center" colSpan={6}>
                      No startups found for this stage.
                    </td>
                  </tr>
                ) : (
                  rows.map((s, i) => {
                    const id = s.id;
                    const reviewHref = id
                      ? `/challenge/${encodeURIComponent(slug)}/startup/${encodeURIComponent(
                          id
                        )}`
                      : "#";
                    return (
                      <tr key={id ?? `row-${i}`} className="td">
                        <td className="py-2 px-3">{i + 1}</td>
                        <td className="py-2 px-3">{s.name || "—"}</td>
                        <td className="py-2 px-3">{s.location || "—"}</td>
                        <td className="py-2 px-3">{s.stage || "—"}</td>
                        <td className="py-2 px-3">{s.status || "—"}</td>
                        <td className="py-2 px-3">
                          {id ? (
                            <a className="btn btn-outline" href={reviewHref}>
                              Review
                            </a>
                          ) : (
                            <button
                              className="btn btn-outline opacity-50 cursor-not-allowed"
                              disabled
                            >
                              Review
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500">
              Select an edition and then a stage to view startups.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
