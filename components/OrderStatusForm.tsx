"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED', 
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED'
] as const;

const PAYMENT_STATUSES = [
  'UNPAID',
  'PENDING',
  'PAID',
  'REFUNDED',
] as const;

type Mode = 'order' | 'payment';

export default function OrderStatusForm({ orderId, currentStatus, mode = 'order' }: { orderId: string; currentStatus: string; mode?: Mode }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'payment' ? { paymentStatus: status } : { status }),
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded px-3 py-1 text-sm"
        disabled={loading}
      >
        {(mode === 'payment' ? PAYMENT_STATUSES : ORDER_STATUSES).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || status === currentStatus}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
