'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';

type Edition = { id: string; name: string };

export default function EditionsPicker({
  editions,
  slug,
}: {
  editions: Edition[];
  slug: string;
}) {
  const router = useRouter();
  const search = useSearchParams();

  const currentEdition = search.get('edition_id') ?? '';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const sp = new URLSearchParams(Array.from(search.entries()));

    // update edition
    if (value) sp.set('edition_id', value);
    else sp.delete('edition_id');

    // if no edition, also drop any stray round
    if (!value) sp.delete('round_id');

    const qs = sp.toString();
    const href = (
      `/challenge/${encodeURIComponent(slug)}/startups${qs ? `?${qs}` : ''}`
    ) as Route; // <-- satisfies typed routes

    router.replace(href);
  }

  return (
    <select className="input w-full" value={currentEdition} onChange={handleChange}>
      <option value="">{editions.length ? 'Select an edition' : 'No editions found'}</option>
      {editions.map((e) => (
        <option key={e.id} value={e.id}>
          {e.name}
        </option>
      ))}
    </select>
  );
}
