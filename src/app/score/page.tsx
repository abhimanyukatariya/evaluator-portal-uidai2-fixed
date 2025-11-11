// src/app/score/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Header from '@/components/header';
import Sidebar from '@/components/sidebar';

// Fallback criteria (your existing mock structure)
import { reviewCriteria as fallbackCriteria } from '@/data/mock';

// Light API hooks (work even if backend is not ready)
import { listScoreCriteria, saveScores } from '@/lib/admin_api';

// ----------------------------- Types ------------------------------

type Criterion = {
  id: string;
  label: string;
  max: number;
  comment_required?: boolean;
};

type CriteriaGroup = {
  title: string;
  items: Criterion[];
};

type ScoreDraft = {
  scores: Record<string, number>;
  comments?: Record<string, string>;
};

// Toggle using API criteria via env (default: use local mock to avoid 404 noise)
const USE_API_CRITERIA =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_USE_API_CRITERIA === '1';

// ----------------------------- Page -------------------------------

export default function ScorePage() {
  const search = useSearchParams();

  // NOTE: this page gets its context from the query string
  const slug = search.get('slug') ?? '';          // optional (for Back link)
  const appId = search.get('id') ?? '';           // application id (required)
  const edition_id = search.get('edition_id') ?? '';
  const round_id = search.get('round_id') ?? '';

  // Toggle optional comment boxes
  const [showComments, setShowComments] = useState(false);

  // Criteria (API -> fallback)
  const [groups, setGroups] = useState<CriteriaGroup[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(true);

  // Draft state
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  // Local storage key (scoped per app + round)
  const storageKey = useMemo(
    () => `review-draft:${appId || 'unknown'}:${round_id || 'all'}`,
    [appId, round_id]
  );

  // ---------- Load criteria ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingCriteria(true);

      // Prefer local mock unless explicitly enabled via env, to avoid 404 logs
      if (!USE_API_CRITERIA || !appId) {
        const parsed = (fallbackCriteria as any)?.map((g: any) => ({
          title: String(g.title ?? 'Criteria'),
          items: g.items.map((i: any) => ({
            id: String(i.id),
            label: String(i.label),
            max: Number(i.max),
          })),
        }));
        if (mounted) {
          setGroups(parsed);
          setLoadingCriteria(false);
        }
        return;
      }

      try {
        const apiRes: any = await listScoreCriteria(appId);

        let parsed: CriteriaGroup[] = [];
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
    } catch {}
  }, [storageKey]);

  // ---------- Persist to localStorage ----------
  useEffect(() => {
    try {
      const payload: ScoreDraft = { scores, comments };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {}
  }, [storageKey, scores, comments]);

  // ---------- Derived totals ----------
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

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
    const requiredCommentsOk = allItems.every((i) =>
      i.comment_required ? Boolean((comments[i.id] || '').trim()) : true
    );
    const scoresOk = allItems.every((i) =>
      Number.isFinite(scores[i.id]) && scores[i.id] >= 0
    );
    return requiredCommentsOk && scoresOk;
  }, [allItems, scores, comments]);

  // ---------- Actions ----------
  async function onSaveDraft() {
    try {
      const payload = {
        edition_id: edition_id || undefined,
        round_id: round_id || undefined,
        application_id: appId || undefined,
        scores: allItems.map((i) => ({
          criteria_id: i.id,
          criteria_score: Number(scores[i.id] || 0),
          comment: comments[i.id] || '',
          max: i.max,
        })),
        status: 'DRAFT',
        total: totalScore,
      };

      if (appId) {
        await saveScores(appId, payload).catch(() => null);
      }
      alert('Draft saved (locally and/or API if available).');
    } catch (err) {
      console.error('[score] save draft failed', err);
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
        application_id: appId || undefined,
        scores: allItems.map((i) => ({
          criteria_id: i.id,
          criteria_score: Number(scores[i.id] || 0),
          comment: comments[i.id] || '',
          max: i.max,
        })),
        status: 'SUBMITTED',
        total: totalScore,
      };

      if (!appId) {
        alert('Missing application id in the URL (id=).');
        return;
      }

      await saveScores(appId, payload);

      localStorage.removeItem(storageKey);
      alert('Scores submitted!');
    } catch (err) {
      console.error('[score] submit failed', err);
      alert('Submit failed. Please try again later.');
    }
  }

  const backHref =
    slug && appId
      ? {
          pathname: `/challenge/${slug}/startup/${appId}`,
          query: {
            ...(edition_id && { edition_id }),
            ...(round_id && { round_id }),
          },
        }
      : '/';

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
                type="button"                          // prevent page POST
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

          {/* Title stripe */}
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
                      {group.items.map((item) => (
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
                                  updateScore(item.id, item.max, Number(e.target.value))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.preventDefault();
                                }}
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
                                  onChange={(e) => updateComment(item.id, e.target.value)}
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
              <button type="button" className="btn btn-outline" onClick={onSaveDraft}>
                Save Draft
              </button>
              <button
                type="button"                                   // prevent page POST
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
