"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams?.callbackUrl || '/admin';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn('email', { email, callbackUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-gray-600 mt-1">Enter your email to receive a magic link.</p>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border rounded px-3 py-2 flex-1"
          aria-label="Email"
        />
        <button disabled={loading} type="submit" className="bg-gray-900 text-white rounded px-4 py-2">
          {loading ? 'Sending…' : 'Send Link'}
        </button>
      </form>
    </div>
  );
}
