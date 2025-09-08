"use client";

import { useEffect, useState } from 'react';

export type CutoffInfo = {
  label: string;
  iso: string; // next cutoff ISO
  isOpen: boolean;
};

export default function Countdown({ cutoff }: { cutoff: CutoffInfo }) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const target = new Date(cutoff.iso).getTime();
    const id = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [cutoff.iso]);

  return (
    <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 animate-pulse-gentle">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-gray-700 font-medium">Order by {cutoff.label}</span>
      </div>
      <div className="h-4 w-px bg-gray-300"></div>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-salmon-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="tabular-nums font-mono text-lg font-semibold text-gray-900" aria-live="polite">
          {remaining}
        </span>
      </div>
      {!cutoff.isOpen && (
        <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Next week
        </div>
      )}
    </div>
  );
}
