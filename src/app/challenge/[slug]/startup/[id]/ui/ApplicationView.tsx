"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { saveScores } from "@/lib/admin_api";

type Props = {
  slug: string;
  app: any;
  criteria: Array<{ id: string; name: string; weightage?: number }>;
  evaluatorScores: Array<any>;
};

function isUrl(val: unknown) {
  if (typeof val !== "string") return false;
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

function formatLabel(raw: string) {
  // similar to your Angular helpers
  return raw
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

export default function ApplicationView({ slug, app, criteria, evaluatorScores }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [scores, setScores] = useState<Record<string, { score?: string; comment?: string }>>({});

  // ----------- normalize incoming data -----------
  const challengeName = app?.challenge_name ?? app?.challenge ?? "—";

  const companyProfile = app?.company_profile ?? {};
  // vendor split: keys ending with "m" → management
  const { company, management } = useMemo(() => {
    const comp: Record<string, any> = {};
    const mgmt: Record<string, any> = {};
    Object.entries(companyProfile || {}).forEach(([k, v]) => {
      if (k.endsWith("m")) mgmt[k] = v;
      else comp[k] = v;
    });
    return { company: comp, management: mgmt };
  }, [companyProfile]);

  const companyKeys = useMemo(
    () =>
      Object.keys(company).filter((k) => {
        const v = company[k];
        return v !== null && v !== undefined && typeof v !== "object" && String(v).trim() !== "";
      }),
    [company]
  );

  const managementKeys = useMemo(
    () =>
      Object.keys(management).filter((k) => {
        const v = management[k];
        return v !== null && v !== undefined && typeof v !== "object" && String(v).trim() !== "";
      }),
    [management]
  );

  const step3 = app?.sections?.step3 ?? {};
  const step4 = app?.sections?.step4 ?? {};

  const documents: Array<{ tag?: string; url?: string }> = Array.isArray(app?.documents) ? app.documents : [];

  const companyImg =
    documents.find((d) => d.tag === "company")?.url ??
    documents.find((d) => !!d.url)?.url ??
    "/placeholder.svg";

  const memberImg =
    documents.find((d) => d.tag === "member")?.url ??
    documents.find((d) => !!d.url)?.url ??
    "/placeholder.svg";

  // very basic role check; tweak when you store role in token/state
  const isEvaluator = typeof window !== "undefined" && localStorage.getItem("role") === "evaluator";

  async function handleDownload() {
    try {
      setIsDownloading(true);
      // simple JSON download (replace with your PDF export endpoint if needed)
      const blob = new Blob([JSON.stringify(app ?? {}, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `application-${app?.id ?? "export"}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleSaveScores() {
    const payload = Object.entries(scores).map(([criteriaId, v]) => ({
      criteria_id: criteriaId,
      criteria_score: Number(v.score ?? 0),
      comment: v.comment ?? "",
    }));
    await saveScores(String(app?.id ?? app?.application_id ?? ""), { scores: payload });
    alert("Scores saved.");
  }

  return (
    <div className="space-y-4">
      {isDownloading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="loader mb-2" />
          <p className="text-white">Downloading…</p>
        </div>
      )}

      {/* top actions */}
      <div className="flex justify-end gap-3">
        {isEvaluator ? (
          <button
            className="btn btn-primary"
            onClick={() => {
              const el = document.getElementById("score-sheet");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Assign Score
          </button>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={() => {
                const el = document.getElementById("evaluator-scores");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Scores By Evaluators
            </button>
            <button className="btn btn-primary" onClick={handleDownload}>
              Download
            </button>
          </>
        )}
      </div>

      {/* back to startups */}
      <div className="card p-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          href={`/challenge/${encodeURIComponent(slug)}/startups`}
        >
          ← Back to Applications
        </Link>
      </div>

      {/* challenge name */}
      <div className="card p-4">
        <p className="text-center text-lg font-semibold">{challengeName}</p>
      </div>

      {/* company profile */}
      <div className="card p-6 space-y-4">
        <h3 className="text-xl font-semibold text-center">Company Profile</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={companyImg}
              alt="Company"
              className="w-full h-64 object-cover rounded-xl border"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.svg")}
            />
          </div>

          <ul className="list-disc pl-5 space-y-3">
            {companyKeys.map((k) => (
              <li key={k} className="leading-relaxed">
                <span className="font-semibold">{formatLabel(k)}</span>: {String(company[k])}
              </li>
            ))}

            {companyKeys.length === 0 && <li className="text-slate-500">No company profile fields.</li>}
          </ul>
        </div>
      </div>

      {/* management team */}
      <div className="card p-6 space-y-4">
        <h3 className="text-xl font-semibold text-center">Management Team</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <img
              src={memberImg}
              alt="Member"
              className="h-40 w-40 object-cover rounded-xl border"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder.svg")}
            />
            <ul className="list-disc pl-5 space-y-3">
              {managementKeys.map((k) => (
                <li key={k}>
                  <span className="font-semibold">{formatLabel(k)}</span>: {String(management[k])}
                </li>
              ))}
              {managementKeys.length === 0 && <li className="text-slate-500">No management fields.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* step3 blocks */}
      <div className="card p-6 space-y-6">
        {Object.keys(step3).length === 0 ? (
          <p className="text-slate-500">No additional section data.</p>
        ) : (
          Object.keys(step3).map((key) => (
            <div key={key} className="space-y-1">
              <h4 className="font-semibold">{formatLabel(key)}</h4>
              <p className="text-slate-700 whitespace-pre-wrap">{String(step3[key] ?? "—")}</p>
            </div>
          ))
        )}
      </div>

      {/* step4: Additional Questions */}
      <div className="card p-6 space-y-6">
        <h3 className="text-xl font-semibold text-center">Additional Questions</h3>
        {Object.keys(step4).length === 0 ? (
          <p className="text-slate-500">No responses found.</p>
        ) : (
          Object.keys(step4).map((k) => {
            const v = step4[k];
            return (
              <div key={k} className="rounded-lg border p-4 bg-slate-50">
                <h4 className="font-semibold mb-1">{formatLabel(k)}</h4>
                {isUrl(v) ? (
                  <a className="text-blue-600 underline break-all" href={String(v)} target="_blank" rel="noreferrer">
                    Click here
                  </a>
                ) : (
                  <p className="whitespace-pre-wrap">{String(v ?? "—")}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* evaluator scores table for PMs */}
      {!isEvaluator && (
        <div className="card p-6 space-y-4" id="evaluator-scores">
          <h3 className="text-xl font-semibold text-center">Scores</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="th">
                  <th className="text-left py-2 px-3">Sl no</th>
                  <th className="text-left py-2 px-3">Evaluator</th>
                  <th className="text-left py-2 px-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {evaluatorScores?.length ? (
                  evaluatorScores.map((row: any, i: number) => (
                    <tr key={row?.id ?? i} className="td">
                      <td className="py-2 px-3">{i + 1}</td>
                      <td className="py-2 px-3">
                        {row?.first_name} {row?.last_name}
                      </td>
                      <td className="py-2 px-3">{row?.score ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="td">
                    <td className="py-4 px-3 text-center" colSpan={3}>
                      No evaluator scores yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* score sheet for Evaluator */}
      {isEvaluator && (
        <div className="card p-6 space-y-4" id="score-sheet">
          <h3 className="text-xl font-semibold text-center">Score Sheet</h3>

          <div className="space-y-6">
            {criteria?.length ? (
              criteria.map((c, i) => {
                const entry = scores[c.id] || {};
                const weight = Number(c.weightage ?? 0);
                const valueNum = Number(entry.score ?? "");
                const outOf = isFinite(weight) && weight > 0 ? weight : undefined;

                return (
                  <div key={c.id} className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <p className="font-medium">{c.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          className="input w-24"
                          type="number"
                          value={entry.score ?? ""}
                          onChange={(e) =>
                            setScores((s) => ({ ...s, [c.id]: { ...s[c.id], score: e.target.value } }))
                          }
                          min={0}
                          max={outOf ?? undefined}
                          placeholder="score"
                        />
                        {outOf !== undefined && <span>/ {outOf}</span>}
                      </div>

                      <textarea
                        className="input w-full"
                        placeholder="Enter remarks"
                        value={entry.comment ?? ""}
                        onChange={(e) =>
                          setScores((s) => ({ ...s, [c.id]: { ...s[c.id], comment: e.target.value } }))
                        }
                      />
                      {outOf !== undefined && valueNum > outOf && (
                        <p className="text-sm text-red-600">Score must be ≤ {outOf}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center">No criteria configured.</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button className="btn btn-primary" onClick={handleSaveScores}>
              Save
            </button>
            <a className="btn btn-outline" href={`/challenge/${slug}/startups`}>
              Close
            </a>
          </div>
        </div>
      )}

      <div>
        <Link className="inline-flex items-center gap-2 text-sm font-medium hover:underline" href={`/challenge/${slug}/startups`}>
          ← Back to Applications
        </Link>
      </div>
    </div>
  );
}
