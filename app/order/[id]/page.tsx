import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BIT_PHONE, PAYBOX_PHONE, BRAND_NAME } from '@/lib/config';

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
        <div className="p-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₪{Number(order.subtotal).toFixed(2)}</span>
          </div>
          {Number((order as any).deliveryFee || 0) > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery fee</span>
              <span>₪{Number((order as any).deliveryFee).toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="font-semibold">₪{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 border rounded">
        <div className="p-4 border-b font-medium">Payment</div>
        <div className="p-4 space-y-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span>Method</span>
            <span className="font-medium">{(order as any).paymentMethod || '-'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              (order as any).paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
              (order as any).paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              (order as any).paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {(order as any).paymentStatus || '-'}
            </span>
          </div>
          {(order as any).paymentExpiresAt && ((order as any).paymentStatus === 'PENDING' || (order as any).paymentStatus === 'UNPAID') && (
            <div className="text-xs text-gray-600">Please complete payment by <span className="font-medium">{new Date((order as any).paymentExpiresAt as any).toLocaleString()}</span>.</div>
          )}
          {(order as any).paymentMethod === 'CASH' && (
            <p>You selected cash. Please have the exact amount ready on delivery/pickup.</p>
          )}
          {(order as any).paymentMethod === 'BIT' && BIT_PHONE && (
            <div className="bg-blue-50 border border-blue-100 rounded p-3">
              <p className="font-medium">Pay with Bit</p>
              <p>Send ₪{Number(order.total).toFixed(2)} to <span className="font-semibold">{BIT_PHONE}</span>.</p>
              <p>Memo: {BRAND_NAME} · Order {order.code}</p>
            </div>
          )}
          {(order as any).paymentMethod === 'PAYBOX' && PAYBOX_PHONE && (
            <div className="bg-blue-50 border border-blue-100 rounded p-3">
              <p className="font-medium">Pay with PayBox</p>
              <p>Send ₪{Number(order.total).toFixed(2)} to <span className="font-semibold">{PAYBOX_PHONE}</span>.</p>
              <p>Memo: {BRAND_NAME} · Order {order.code}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-gray-700">We will be in touch for Friday delivery. For questions, contact us.</p>
        <Link href="/" className="inline-block mt-3 px-4 py-2 rounded bg-gray-900 text-white">Back to Home</Link>
      </div>
    </div>
  );
}
