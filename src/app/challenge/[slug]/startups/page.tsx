// src/app/challenge/[slug]/startups/page.tsx
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { formatUTCDate } from "@/utils/date";

import { listApplications } from "@/lib/admin_api";

type Params = { params: { slug: string } };


const ROUND_ID_MAP: Record<string, string | undefined> = {
  "face-liveness": process.env.EVALUATOR_ROUND_ID,
  "contactless-fingerprint": process.env.ROUND_CONTACTLESS_FINGERPRINT_ID,
  "presentation-attack": process.env.ROUND_PRESENTATION_ATTACK_ID,
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
  for (const v of vals) if (v !== undefined && v !== null && String(v).trim() !== "") return v as T;
  return "" as T;
}

function normalizeRows(arr: ApiRow[]): VmRow[] {
  return arr.map((r) => {
    
    const id = pick<string>(r.startup_id, r.id, r.user_id);

    
    const name = pick<string>(
      r.startup_name,
      r.companyname,      
      r.company_name,
      r.companyName,
      r.name,
      r.namew,            
      r.startup,
    ) || "—";

    
    const location = pick<string>(
      r.location,
      r.city,
      r.cityc,            
      r.statec,
      r.state
    ) || "—";

    
    const stage = pick<string>(r.stage, r.stagec) || "—";
    const status = pick<string>(r.status, r.progress_state) || "—";

    return { id, name, location, stage, status };
  });
}

export default async function StartupsPage({ params }: Params) {
  const roundId =
    ROUND_ID_MAP[params.slug] ??
    process.env.EVALUATOR_ROUND_ID ??
    ""; 

  let rows: VmRow[] = [];

  try {
    if (!roundId) {
      console.warn("[startups] No round id available for:", params.slug);
    } else {
      const raw = await listApplications(roundId);
      
      rows = normalizeRows(Array.isArray(raw) ? raw : []);
    }
  } catch (err) {
    console.error("[startups] failed to load applications:", err);
  }

  return (
    <main className="min-h-screen">
      {}
      {}

      <section className="flex-1 space-y-6">
        {/* Title + Back */}
        {/* … */}

        <div className="card p-6 overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="th">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Company</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Stage</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="td">
                  <td className="py-3 px-3" colSpan={6} style={{ textAlign: "center" }}>
                    No startups found for this round.
                  </td>
                </tr>
              ) : (
                rows.map((s, i) => {
                  const displayId = s.id;
                  
                  const reviewHref =
                    (`/challenge/${params.slug}/startup/${encodeURIComponent(displayId ?? "")}` as
                      `/challenge/${string}/startup/${string}`);

                  return (
                    <tr key={`${s.id ?? i}`} className="td">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">{s.name || "—"}</td>
                      <td className="py-2 px-3">{s.location || "—"}</td>
                      <td className="py-2 px-3">{s.stage || "—"}</td>
                      <td className="py-2 px-3">{s.status || "—"}</td>
                      <td className="py-2 px-3">
                        {displayId ? (
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

