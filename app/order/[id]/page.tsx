import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true, flavor: true } } },
  });
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-10"><p>Order not found.</p></div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Thank you! Your order is placed.</h1>
      <p className="text-gray-600 mt-1">Order code: <span className="font-mono">{order.code}</span></p>
      <div className="mt-6 border rounded">
        <div className="p-4 border-b font-medium">Summary</div>
        <ul className="p-4 space-y-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between">
              <span>{i.product.name}{i.flavor ? ` (${i.flavor.name})` : ''} × {i.quantity}</span>
              <span>₪{Number(i.unitPrice) * i.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t flex items-center justify-between">
          <span>Total</span>
          <span className="font-semibold">₪{Number(order.total)}</span>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-gray-700">We will be in touch for Friday delivery. For questions, contact us.</p>
        <Link href="/" className="inline-block mt-3 px-4 py-2 rounded bg-gray-900 text-white">Back to Home</Link>
      </div>
    </div>
  );
}
