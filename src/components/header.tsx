'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';


type HeaderProps = { title?: string; showBack?: boolean };

export default function Header({ title, showBack }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="container-max h-14 flex items-center justify-between">
        {}
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft size={18} />
            </button>
          )}
          <Image
            src="/msh-logo.png"
            alt="MeitY Startup Hub"
            width={34}
            height={34}
            className="rounded-full"
          />
          <span className="font-semibold">
            {title ?? 'MeitY Startup Hub — Evaluator Portal'}
          </span>
        </div>

        {/* Right section: Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/landing" className="text-sm hover:text-primary">
            Home Page
          </Link>
          <Link href="/history" className="text-sm hover:text-primary">
            History
          </Link>
          <Link href="/analytics" className="text-sm hover:text-primary">
            Analytics
          </Link>
          <Link href="/evaluations" className="text-sm hover:text-primary">
            My Reviews
          </Link>
          
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
