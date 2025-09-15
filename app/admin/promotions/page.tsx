import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { code: 'asc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Promotions</h2>
        <Link href="/admin/promotions/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          New Promotion
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Value</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Starts</th>
              <th className="py-2 pr-4">Ends</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4 font-mono">{p.code}</td>
                <td className="py-2 pr-4">{p.type}</td>
                <td className="py-2 pr-4">
                  {p.type === 'PERCENTAGE' ? `${p.value}%` : `₪${p.value}`}
                </td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 pr-4">{p.startsAt ? new Date(p.startsAt).toLocaleDateString() : '—'}</td>
                <td className="py-2 pr-4">{p.endsAt ? new Date(p.endsAt).toLocaleDateString() : '—'}</td>
                <td className="py-2 pr-4">
                  <Link href={`/admin/promotions/${p.id}`} className="text-blue-600 underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
