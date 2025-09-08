import Link from 'next/link';
import { BRAND_NAME } from '@/lib/config';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">{BRAND_NAME} Admin</h1>
          <nav className="flex items-center gap-4 text-sm text-gray-700">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/promotions">Promotions</Link>
          </nav>
        </div>
        <AdminHeader />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
