'use client';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import React from 'react';
import { useRouter } from 'next/navigation';

    
export default function ProfilePage() {
  const router = useRouter();
  // Replace with real auth data later
  const evaluator = {
    name: 'Evaluator Name',
    email: 'evaluator@example.com',
    role: 'Evaluator — UIDAI SITAA Challenge',
    organization: 'MeitY Startup Hub',
    lastLogin: '2025-10-26T10:00:00Z',
  };
  
  const handleSignOut = () => {
    // Clear session data (if any)
    try {
      localStorage.removeItem('token'); // optional if you use localStorage auth
      sessionStorage.clear();
    } catch (err) {
      console.error(err);
    }

    // Redirect to login
    router.replace('/login'); // ✅ takes user to login page
  };


  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />
        <section className="flex-1 space-y-6">
          <div className="card p-6 max-w-2xl">
            <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

            <div className="grid gap-4">
              <Field label="Name" value={evaluator.name} />
              <Field label="Email" value={evaluator.email} />
              <Field label="Role" value={evaluator.role} />
              <Field label="Organization" value={evaluator.organization} />
              <Field label="Last Login" value={new Date(evaluator.lastLogin).toUTCString()} />
            </div>

            {/* Optional actions row */}
            <div className="mt-6 flex gap-3">
              <button className="btn btn-outline">Change Password</button>
              <button
            onClick={handleSignOut}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
          >
            Sign out
          </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  );
}
