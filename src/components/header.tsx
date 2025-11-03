'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // put your real logout here (clear auth cookie/JWT, call /api/logout, etc.)
    try {
      localStorage.removeItem('token');
    } catch {}
    router.replace('/'); // or '/login'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="container-max h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/msh-logo.png" 
            alt="MeitY Startup Hub"
            width={34}
            height={34}
            className="rounded-full"
          />
          <span className="font-semibold">MeitY Startup Hub — Evaluator Portal</span>
          
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/landing" className="text-sm hover:text-primary">Landing</Link>
          <Link href="/history" className="text-sm hover:text-primary">History</Link>
          <Link href="/analytics" className="text-sm hover:text-primary">Analytics</Link>
          <Link href="/evaluations" className="text-sm hover:text-primary">My Reviews</Link>

          <button className="p-2 rounded-lg hover:bg-slate-100" aria-label="Notifications">
            <Bell size={18} />
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-slate-100"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}
