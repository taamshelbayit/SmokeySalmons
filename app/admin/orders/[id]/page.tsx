import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';
import OrderStatusForm from '@/components/OrderStatusForm';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true, flavor: true } } },
  });

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p>Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Order {order.code}</h1>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Customer Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd>{order.contactName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Phone:</dt>
                <dd>{order.contactPhone}</dd>
              </div>
              {order.contactEmail && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email:</dt>
                  <dd>{order.contactEmail}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Delivery Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Method:</dt>
                <dd>{order.method}</dd>
              </div>
              {order.deliverySlot && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Time Slot:</dt>
                  <dd>{order.deliverySlot}</dd>
                </div>
              )}
              {order.city && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">City:</dt>
                  <dd>{order.city}</dd>
                </div>
              )}
              {order.street && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Street:</dt>
                  <dd>{order.street}</dd>
                </div>
              )}
              {order.apt && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">Apt/Floor:</dt>
                  <dd>{order.apt}</dd>
                </div>
              )}
              {order.deliveryNotes && (
                <div>
                  <dt className="text-gray-600 mb-1">Notes:</dt>
                  <dd className="bg-gray-50 p-2 rounded text-xs">{order.deliveryNotes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Order Items</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    {item.flavor && (
                      <div className="text-sm text-gray-600">{item.flavor.name}</div>
                    )}
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₪{(Number(item.unitPrice) * item.quantity).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">₪{Number(item.unitPrice).toFixed(2)} each</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₪{Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number((order as any).deliveryFee || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery fee</span>
                  <span>₪{Number((order as any).deliveryFee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₪{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Order Info</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Placed:</dt>
                <dd>{new Date(order.placedAt).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status:</dt>
                <dd>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'READY' ? 'bg-green-100 text-green-800' :
                    order.status === 'DELIVERED' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Payment</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Method:</dt>
                <dd>{(order as any).paymentMethod || '-'}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-600">Status:</dt>
                <dd className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    (order as any).paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    (order as any).paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    (order as any).paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(order as any).paymentStatus || '-'}
                  </span>
                  <OrderStatusForm orderId={order.id} currentStatus={(order as any).paymentStatus || 'UNPAID'} mode="payment" />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
