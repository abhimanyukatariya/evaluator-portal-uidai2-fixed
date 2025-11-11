// src/app/score/page.tsx
import React, { Suspense } from 'react';
import ScoreClient from './score-client';

// Optional: keeps the page fully dynamic (no caching/prerender)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ScoreClient />
    </Suspense>
  );
}
