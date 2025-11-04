// src/app/challenge/[slug]/startups/page.tsx
export const dynamic = "force-dynamic"; // no static optimization
export const revalidate = 0;            // always fetch fresh on request

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
// (Optional) If you don’t use Link/formatUTCDate, you can delete these imports.
// import Link from "next/link";
// import { formatUTCDate } from "@/utils/date";

import { listApplications } from "@/lib/adminClient";

type Params = { params: { slug: string } };

// Map your challenge slugs to the round ids you configured in Vercel/`.env.local`
const ROUND_ID_MAP: Record<string, string | undefined> = {
  "face-liveness":            process.env.EVALUATOR_ROUND_ID,
  "contactless-fingerprint":  process.env.ROUND_CONTACTLESS_FINGERPRINT_ID,
  "presentation-attack":      process.env.ROUND_PRESENTATION_ATTACK_ID,
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
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return v as T;
    }
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
        r.namew,      // seen in some payloads
        r.startup
      ) || "—";

    const location =
      pick<string>(
        r.location,
        r.city,
        r.cityc,      // seen in some payloads
        r.statec,
        r.state
      ) || "—";

    const stage  = pick<string>(r.stage, r.stagec) || "—";
    const status = pick<string>(r.status, r.progress_state) || "—";

    return { id, name, location, stage, status };
  });
}

export default async function StartupsPage({ params }: Params) {
  const roundId =
    ROUND_ID_MAP[params.slug] ??
    process.env.EVALUATOR_ROUND_ID ?? // final fallback if you want one
    "";

  let rows: VmRow[] = [];

  try {
    if (!roundId) {
      console.warn("[startups] Missing round id for slug:", params.slug);
    } else {
      // This executes on the server and reads the HttpOnly auth cookie via adminClient
      const payload = await listApplications(String(roundId));

      // API may return either { results: [...] } or a bare array
      const raw: ApiRow[] = Array.isArray(payload) ? payload : (payload?.results ?? []);
      rows = normalizeRows(raw);
    }
  } catch (err) {
    console.error("[startups] Failed to load applications:", err);
  }

  const titleLabel =
    params.slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <main className="min-h-screen flex">
      {/* Left nav (optional) */}
      <aside className="hidden md:block w-64 border-r bg-white/60">
        <Sidebar />
      </aside>

      <section className="flex-1 p-4 md:p-8 space-y-6">
        {/* Header */}
        <Header title={`Startups — ${titleLabel}`} showBack />

        {/* Table */}
        <div className="card p-6 overflow-x-auto">
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
                    No startups found for this round.
                  </td>
                </tr>
              ) : (
                rows.map((s, i) => {
                  const displayId = s.id;
                  const reviewHref = displayId
                    ? `/challenge/${encodeURIComponent(params.slug)}/startup/${encodeURIComponent(
                        displayId
                      )}`
                    : "#";

                  return (
                    <tr key={displayId ?? `row-${i}`} className="td">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{s.name || "—"}</td>
                      <td className="py-2 px-3">{s.location || "—"}</td>
                      <td className="py-2 px-3">{s.stage || "—"}</td>
                      <td className="py-2 px-3">{s.status || "—"}</td>
                      <td className="py-2 px-3">
                        {displayId ? (
                          // Use a plain <a> to avoid “dynamic href in <Link>” warnings.
                          <a className="btn btn-outline" href={reviewHref}>
                            Review
                          </a>
                        ) : (
                          <button className="btn btn-outline opacity-50 cursor-not-allowed" disabled>
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
        </div>
      </section>
    </main>
  );
}
