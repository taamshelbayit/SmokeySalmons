import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { placedAt: 'desc' },
    include: { items: { include: { product: true, flavor: true } } },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Items</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(o.placedAt).toLocaleString()}</td>
                <td className="py-2 pr-4 font-mono"><Link href={`/admin/orders/${o.id}`} className="underline">{o.code}</Link></td>
                <td className="py-2 pr-4">{o.contactName} · {o.contactPhone}</td>
                <td className="py-2 pr-4">
                  <ul className="list-disc ml-5">
                    {o.items.map(i => (
                      <li key={i.id}>{i.product.name}{i.flavor ? ` (${i.flavor.name})` : ''} × {i.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">₪{Number(o.total).toFixed(2)}</td>
                <td className="py-2 pr-4">{o.status}</td>
                <td className="py-2 pr-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600">{(o as any).paymentMethod || '-'}</span>
                    <span className={`text-xs font-medium ${
                      (o as any).paymentStatus === 'PAID' ? 'text-green-600' :
                      (o as any).paymentStatus === 'PENDING' ? 'text-amber-600' :
                      (o as any).paymentStatus === 'UNPAID' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {(o as any).paymentStatus || '-'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
