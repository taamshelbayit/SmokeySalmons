"use client";

import { useSession, signOut } from 'next-auth/react';

export default function AdminHeader() {
  const { data } = useSession();
  const email = data?.user?.email || 'Admin';
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-600">{email}</span>
      <button onClick={() => signOut({ callbackUrl: '/' })} className="border rounded px-3 py-1">Sign out</button>
    </div>
  );
}
