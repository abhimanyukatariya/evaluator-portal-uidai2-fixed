'use client';

import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import {
  myAssignedReviews,
  myCompletedReviews,
  type ReviewItem,
} from '@/data/mock';
import { formatUTCDate } from '@/utils/date';
import { useState, useMemo } from 'react';

type Tab = 'assigned' | 'completed';

export default function MyReviewsPage() {
  const [tab, setTab] = useState<Tab>('assigned');

  const stats = useMemo(() => {
    const a = myAssignedReviews.length;
    const c = myCompletedReviews.length;
    return { assigned: a, completed: c, total: a + c };
  }, []);

  const rows: ReviewItem[] =
    tab === 'assigned' ? myAssignedReviews : myCompletedReviews;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />
        <section className="flex-1 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-semibold">My Reviews</h1>
                <p className="text-slate-600">
                  Challenges assigned to you and the ones you’ve completed.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Assigned" value={stats.assigned} />
                <MiniStat label="Completed" value={stats.completed} />
                <MiniStat label="Total" value={stats.total} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3">
            <TabBtn active={tab === 'assigned'} onClick={() => setTab('assigned')}>
              Assigned to Me
            </TabBtn>
            <TabBtn active={tab === 'completed'} onClick={() => setTab('completed')}>
              Completed
            </TabBtn>
          </div>

          {/* Table */}
          <div className="card p-6 overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="th">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Challenge</th>
                  <th className="py-2 px-3">Startup</th>
                  <th className="py-2 px-3">Stage</th>
                  <th className="py-2 px-3">Assigned On</th>
                  <th className="py-2 px-3">Status</th>
                  {tab === 'completed' && <th className="py-2 px-3">Score</th>}
                  <th className="py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${tab}-${r.id}`} className="td">
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3">{r.challenge}</td>
                    <td className="py-2 px-3">{r.startup}</td>
                    <td className="py-2 px-3">{r.stage}</td>
                    <td className="py-2 px-3">{formatUTCDate(r.assignedOn)}</td>
                    <td className="py-2 px-3">{r.status}</td>
                    {tab === 'completed' && (
                      <td className="py-2 px-3">{r.score ?? '-'}</td>
                    )}
                    <td className="py-2 px-3">
                      {tab === 'assigned' ? (
                        <a className="btn btn-outline" href={`/review/${r.id}`}>
                          Continue Review
                        </a>
                      ) : (
                        <a className="btn btn-outline" href={`/review/${r.id}`}>
                          View / Edit
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-xl border ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
