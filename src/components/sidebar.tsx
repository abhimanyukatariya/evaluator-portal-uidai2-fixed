'use client';

import Link from 'next/link';
import { Home, Clock, BarChart2, ClipboardList, User } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0">
      <div className="sticky top-16">
        <div className="card p-4 m-4">
          <nav className="space-y-1">
            <Link
              href="/landing"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <Home size={18} />
              <span>Landing</span>
            </Link>

            <Link
              href="/history"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <Clock size={18} />
              <span>History</span>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <BarChart2 size={18} />
              <span>Analytics</span>
            </Link>

            <Link
              href="/evaluations" // <-- route for "My Reviews" page
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <ClipboardList size={18} />
              <span>My Reviews</span>
            </Link>

            <Link
              href="/Profile"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
