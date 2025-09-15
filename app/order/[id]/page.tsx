import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BIT_PHONE, PAYBOX_PHONE, BRAND_NAME } from '@/lib/config';
import { generateBitDeepLink, generatePayBoxDeepLink, generateQRCodeUrl, formatPhoneForPayment } from '@/lib/payments';
import PaymentActions from './PaymentActions';

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true, flavor: true } } },
  });
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-10"><p>Order not found.</p></div>;
  
  const total = Number(order.total);
  const paymentMethod = (order as any).paymentMethod;
  const paymentStatus = (order as any).paymentStatus;
  const paymentExpiresAt = (order as any).paymentExpiresAt;
  const deliveryFee = Number((order as any).deliveryFee || 0);
  
  // Generate payment links and QR codes
  const bitDeepLink = paymentMethod === 'BIT' && BIT_PHONE ? generateBitDeepLink(BIT_PHONE, total, `Order ${order.code}`) : null;
  const payboxDeepLink = paymentMethod === 'PAYBOX' && PAYBOX_PHONE ? generatePayBoxDeepLink(PAYBOX_PHONE, total, `Order ${order.code}`) : null;
  const bitQR = bitDeepLink ? generateQRCodeUrl(bitDeepLink) : null;
  const payboxQR = payboxDeepLink ? generateQRCodeUrl(payboxDeepLink) : null;
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold">Thank you! Your order is placed.</h1>
      <p className="text-gray-600 mt-1">Order code: <span className="font-mono" data-testid="order-code">{order.code}</span></p>
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
          {deliveryFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery fee</span>
              <span>₪{deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-bold">
            <span>Total</span>
            <span data-testid="order-total">₪{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Information */}
      {paymentMethod && (
        <div className="mt-6 border rounded">
          <div className="p-4 border-b font-medium">Payment Information</div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${
                paymentStatus === 'PAID' ? 'text-green-600' :
                paymentStatus === 'PENDING' ? 'text-yellow-600' :
                paymentStatus === 'REFUNDED' ? 'text-blue-600' :
                'text-gray-600'
              }`}>{paymentStatus}</span>
            </div>
            {paymentExpiresAt && paymentStatus === 'PENDING' && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Deadline</span>
                <span className="font-medium text-red-600">
                  {new Date(paymentExpiresAt).toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Bit Payment */}
            {paymentMethod === 'BIT' && paymentStatus !== 'PAID' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Pay with Bit</h3>
                <div className="space-y-3">
                  <div className="text-sm text-blue-800">
                    Send ₪{total} to <span className="font-mono font-medium">{BIT_PHONE}</span>
                    <br />Memo: <span className="font-mono">Order {order.code}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {bitDeepLink && (
                      <a 
                        href={bitDeepLink} 
                        className="btn-primary text-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Bit App
                      </a>
                    )}
                    <PaymentActions phone={BIT_PHONE || ''} />
                  </div>
                  {bitQR && (
                    <div className="flex justify-center mt-4">
                      <div className="text-center">
                        <img src={bitQR} alt="Bit Payment QR Code" className="mx-auto mb-2" />
                        <p className="text-xs text-gray-600">Scan with Bit app</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* PayBox Payment */}
            {paymentMethod === 'PAYBOX' && paymentStatus !== 'PAID' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-3">Pay with PayBox</h3>
                <div className="space-y-3">
                  <div className="text-sm text-green-800">
                    Send ₪{total} to <span className="font-mono font-medium">{PAYBOX_PHONE}</span>
                    <br />Memo: <span className="font-mono">Order {order.code}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {payboxDeepLink && (
                      <a 
                        href={payboxDeepLink} 
                        className="btn-primary text-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open PayBox App
                      </a>
                    )}
                    <PaymentActions phone={PAYBOX_PHONE || ''} />
                  </div>
                  {payboxQR && (
                    <div className="flex justify-center mt-4">
                      <div className="text-center">
                        <img src={payboxQR} alt="PayBox Payment QR Code" className="mx-auto mb-2" />
                        <p className="text-xs text-gray-600">Scan with PayBox app</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Cash Payment */}
            {paymentMethod === 'CASH' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Cash Payment</h3>
                <p className="text-sm text-gray-700">Pay ₪{total} in cash upon delivery or pickup.</p>
              </div>
            )}
            
            {/* Payment Confirmation */}
            {paymentStatus === 'PAID' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-green-900">Payment Confirmed</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Thank you! Your payment has been received.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6">
        <p className="text-gray-700">We will be in touch for Friday delivery. For questions, contact us.</p>
        <Link href="/" className="inline-block mt-3 px-4 py-2 rounded bg-gray-900 text-white">Back to Home</Link>
      </div>
    </div>
  );
}
