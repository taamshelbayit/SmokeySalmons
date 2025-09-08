"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPromotionPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const form = new FormData(e.currentTarget);
    const payload = {
      code: String(form.get('code') || '').toUpperCase(),
      type: String(form.get('type') || 'PERCENTAGE'),
      value: Number(form.get('value') || 0),
      minOrderAmount: form.get('minOrderAmount') ? Number(form.get('minOrderAmount')) : null,
      validUntil: form.get('validUntil') ? new Date(String(form.get('validUntil'))) : null,
      active: Boolean(form.get('active')),
    };

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Failed to create promotion');
      router.push('/admin/promotions');
    } catch (err) {
      console.error(err);
      alert('Failed to create promotion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">New Promotion</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Promotion Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            placeholder="SAVE10"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Discount Type
          </label>
          <select id="type" name="type" className="w-full border rounded px-3 py-2">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium mb-1">
            Discount Value
          </label>
          <input
            id="value"
            name="value"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="10"
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            For percentage: enter 10 for 10%. For fixed: enter amount in ₪.
          </p>
        </div>

        <div>
          <label htmlFor="minOrderAmount" className="block text-sm font-medium mb-1">
            Minimum Order Amount (₪)
          </label>
          <input
            id="minOrderAmount"
            name="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="100"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium mb-1">
            Valid Until
          </label>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked
            className="mr-2"
          />
          <label htmlFor="active" className="text-sm">
            Active
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Promotion'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
