import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [totalOrders, placedToday, byStatus] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: {
        placedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-semibold mt-1">{totalOrders}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">Placed Today</div>
          <div className="text-2xl font-semibold mt-1">{placedToday}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-600">Statuses</div>
          <ul className="text-sm mt-1 space-y-1">
            {byStatus.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <span>{s.status}</span>
                <span className="font-medium">{s._count._all}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">This Week</h2>
        <p className="text-sm text-gray-600">Production plan and CSV exports will appear here.</p>
      </div>
    </div>
  );
}
