// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');      
  const [password, setPassword] = useState(''); 
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch('https://api.meity.gov.in/admin/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      document.cookie = `auth_token=${data.token}; path=/; Secure; SameSite=None`;
      if (!res.ok) throw new Error('Invalid credentials');
      console.log('here after login');
      router.replace('/landing');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-screen grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="card p-6 w-[520px] space-y-4"
        autoComplete="off" 
      >
        <h1 className="text-xl font-semibold">Evaluator login</h1>

        <input
          type="email"
          inputMode="email"
          name="login_email"          
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          name="login_password"
          autoComplete="new-password"  
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <p className="text-red-600 text-sm">{err}</p>}

        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </main>
  );
}
