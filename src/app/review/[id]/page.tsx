// src/app/challenge/[slug]/startup/[id]/review/page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import Header from '@/components/header';
import Sidebar from '@/components/sidebar';

// Local fallback criteria (your existing mock)
import { reviewCriteria as fallbackCriteria } from '@/data/mock';

// Light API wiring (safe to keep even if backend is not ready)
import {
  listScoreCriteria,
  saveScores,
} from '@/lib/admin_api';

// ----------------------------- Types ------------------------------

type Criterion = {
  id: string;
  label: string;
  max: number;
  // optional hints the API may return
  comment_required?: boolean;
};

type CriteriaGroup = {
  title: string;
  items: Criterion[];
};

// what we keep in local draft
type ScoreDraft = {
  // criterion id -> score (0..max)
  scores: Record<string, number>;
  // optional comments (criterion id -> comment)
  comments?: Record<string, string>;
};

// ----------------------------- Page -------------------------------

export default function ReviewPage() {
  const params = useParams<{ slug: string; id: string }>();
  const search = useSearchParams();

  const slug = params.slug;
  const appId = params.id;

  // Context preserved from Details page
  const edition_id = search.get('edition_id') ?? '';
  const round_id = search.get('round_id') ?? '';

  // Toggle to show comment boxes even when API doesn't mark them required
  const [showComments, setShowComments] = useState(false);

  // Criteria (try API, else fallback to mock)
  const [groups, setGroups] = useState<CriteriaGroup[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(true);

  // Draft state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  // Local storage key (scoped per app + round for safety)
  const storageKey = useMemo(
    () => `review-draft:${appId}:${round_id || 'all'}`,
    [appId, round_id]
  );

  // ---------- Load criteria ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingCriteria(true);
      try {
        // If your API supports criteria per application:
        const apiRes: any = await listScoreCriteria(appId).catch(() => null);

        // Expecting either:
        // - { results: [{ group: 'Title', items: [{ id, label, max, comment_required? }, ...] }, ...] }
        // - or flat array [{ id, label, max }]
        // If not available, fallback to the local mock structure.
        let parsed: CriteriaGroup[] = [];

        // try structured groups first
        const arr =
          (apiRes && Array.isArray(apiRes.results) && apiRes.results) ||
          (Array.isArray(apiRes) ? apiRes : null);

        if (arr && arr.length) {
          if (arr[0]?.items) {
            parsed = arr.map((g: any) => ({
              title: String(g.group ?? g.title ?? 'Criteria'),
              items: (g.items ?? []).map((i: any) => ({
                id: String(i.id),
                label: String(i.label ?? i.name ?? 'Criterion'),
                max: Number(i.max ?? i.weightage ?? 10),
                comment_required: !!i.comment_required,
              })),
            }));
          } else {
            // flat -> one group
            parsed = [
              {
                title: 'Criteria',
                items: arr.map((i: any) => ({
                  id: String(i.id),
                  label: String(i.label ?? i.name ?? 'Criterion'),
                  max: Number(i.max ?? i.weightage ?? 10),
                  comment_required: !!i.comment_required,
                })),
              },
            ];
          }
        } else {
          // fallback to local mock
          parsed = (fallbackCriteria as any)?.map((g: any) => ({
            title: String(g.title ?? 'Criteria'),
            items: g.items.map((i: any) => ({
              id: String(i.id),
              label: String(i.label),
              max: Number(i.max),
            })),
          }));
        }

        if (mounted) setGroups(parsed);
      } catch {
        // absolute fallback in any error case
        if (mounted) {
          setGroups(
            (fallbackCriteria as any)?.map((g: any) => ({
              title: String(g.title ?? 'Criteria'),
              items: g.items.map((i: any) => ({
                id: String(i.id),
                label: String(i.label),
                max: Number(i.max),
              })),
            }))
          );
        }
      } finally {
        if (mounted) setLoadingCriteria(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [appId]);

  // ---------- Hydrate from localStorage ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: ScoreDraft = JSON.parse(raw);
        setScores(parsed.scores || {});
        setComments(parsed.comments || {});
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // ---------- Persist to localStorage ----------
  useEffect(() => {
    try {
      const payload: ScoreDraft = { scores, comments };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [storageKey, scores, comments]);

  // ---------- Derived totals ----------
  const allItems = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups]
  );

  const totalMax = useMemo(
    () => allItems.reduce((acc, i) => acc + (Number(i.max) || 0), 0),
    [allItems]
  );

  const totalScore = useMemo(
    () => Object.entries(scores).reduce((sum, [, v]) => sum + (Number(v) || 0), 0),
    [scores]
  );

  // ---------- Updaters ----------
  function updateScore(id: string, max: number, value: number) {
    const n = Math.max(0, Math.min(Number(max) || 0, Number(value) || 0));
    setScores((prev) => ({ ...prev, [id]: n }));
  }

  function updateComment(id: string, value: string) {
    setComments((prev) => ({ ...prev, [id]: value }));
  }

  // ---------- Validation ----------
  const allRequiredFilled = useMemo(() => {
    // if API marks some as required (comment_required), enforce non-empty comment
    const requiredCommentsOk = allItems.every((i) =>
      i.comment_required ? Boolean((comments[i.id] || '').trim()) : true
    );
    // require a score entry for each criterion
    const scoresOk = allItems.every((i) =>
      Number.isFinite(scores[i.id]) && scores[i.id] >= 0
    );
    return requiredCommentsOk && scoresOk;
  }, [allItems, scores, comments]);

  // ---------- Actions (wire to API) ----------
  async function onSaveDraft() {
    try {
      // You might have a dedicated "draft" endpoint; if not, keep local-only.
      // This call demonstrates payload shape if you decide to send drafts too.
      const payload = {
        // preserve context for your backend
        edition_id: edition_id || undefined,
        round_id: round_id || undefined,
        application_id: appId,
        // flatten to the vendor-like schema
        scores: allItems.map((i) => ({
          criteria_id: i.id,
          criteria_score: Number(scores[i.id] || 0),
          comment: comments[i.id] || '',
          max: i.max,
        })),
        status: 'DRAFT',
        total: totalScore,
      };

      // If you want draft to remain local, comment the next line:
      await saveScores(appId, payload).catch(() => null);

      alert('Draft saved (locally and/or API if available).');
    } catch (err) {
      console.error('[review] save draft failed', err);
      alert('Could not save draft right now. Your draft is still stored locally.');
    }
  }

  async function onSubmit() {
    if (!allRequiredFilled) {
      alert('Please enter scores for all criteria (and required comments) before submitting.');
      return;
    }
    try {
      const payload = {
        edition_id: edition_id || undefined,
        round_id: round_id || undefined,
        application_id: appId,
        scores: allItems.map((i) => ({
          criteria_id: i.id,
          criteria_score: Number(scores[i.id] || 0),
          comment: comments[i.id] || '',
          max: i.max,
        })),
        status: 'SUBMITTED',
        total: totalScore,
      };

      await saveScores(appId, payload);

      // If successful, you might want to clear local draft:
      localStorage.removeItem(storageKey);
      alert('Scores submitted!');
    } catch (err) {
      console.error('[review] submit failed', err);
      alert('Submit failed. Please try again later.');
    }
  }

  const backHref = {
    pathname: `/challenge/${slug}/startup/${appId}`,
    query: {
      ...(edition_id && { edition_id }),
      ...(round_id && { round_id }),
    },
  };

  // ----------------------------- UI --------------------------------

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />
        <section className="flex-1">
          {/* Top header / nav row */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-semibold">Score / Review</h1>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowComments((s) => !s)}
                title="Toggle comment boxes"
              >
                {showComments ? 'Hide Comments' : 'Add Comments'}
              </button>
              <Link href={backHref} className="btn btn-outline">
                Back to Application
              </Link>
            </div>
          </div>

          {/* Title stripe (kept from your design) */}
          <div className="card mb-6">
            <div className="bg-accent text-white text-center py-6 text-3xl font-semibold">
              Review Page
            </div>
          </div>

          {/* Criteria table */}
          <div className="card p-0 overflow-hidden">
            <table className="table">
              <thead>
                <tr className="th">
                  <th className="py-3 px-4">Parameters</th>
                  <th className="py-3 px-4 w-32">Max Marks</th>
                  <th className="py-3 px-4 w-40">Allotted Marks</th>
                </tr>
              </thead>
              <tbody>
                {loadingCriteria ? (
                  <tr className="td">
                    <td className="py-6 px-4 text-center" colSpan={3}>
                      Loading criteria…
                    </td>
                  </tr>
                ) : groups.length === 0 ? (
                  <tr className="td">
                    <td className="py-6 px-4 text-center" colSpan={3}>
                      No criteria available.
                    </td>
                  </tr>
                ) : (
                  groups.map((group, gi) => (
                    <React.Fragment key={`group-${gi}-${group.title}`}>
                      <tr className="bg-slate-50 border-t">
                        <td className="py-3 px-4 font-semibold" colSpan={3}>
                          {group.title}
                        </td>
                      </tr>
                      {group.items.map((item, ii) => (
                        <React.Fragment key={`row-${gi}-${item.id}`}>
                          <tr className="border-t">
                            <td className="py-3 px-4">{item.label}</td>
                            <td className="py-3 px-4">{item.max}</td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                className="input"
                                value={
                                  Number.isFinite(scores[item.id])
                                    ? String(scores[item.id])
                                    : ''
                                }
                                min={0}
                                max={item.max}
                                placeholder={`0 - ${item.max}`}
                                onChange={(e) =>
                                  updateScore(
                                    item.id,
                                    item.max,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </td>
                          </tr>
                          {(showComments || item.comment_required) && (
                            <tr className="border-t">
                              <td className="py-2 px-4 text-sm text-slate-600" colSpan={3}>
                                <textarea
                                  className="input w-full"
                                  rows={2}
                                  placeholder={
                                    item.comment_required
                                      ? 'Comment (required)'
                                      : 'Comment (optional)'
                                  }
                                  value={comments[item.id] || ''}
                                  onChange={(e) =>
                                    updateComment(item.id, e.target.value)
                                  }
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">
              Total: <span className="font-semibold">{totalScore}</span> / {totalMax}
            </div>
            <div className="flex gap-3">
              <button className="btn btn-outline" onClick={onSaveDraft}>
                Save Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={onSubmit}
                disabled={!allRequiredFilled}
                title={!allRequiredFilled ? 'Enter all scores first' : ''}
              >
                Submit
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
