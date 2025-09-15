"use client";

import { useEffect, useState } from 'react';
import { useCart } from './cart-state';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
const BIT_PHONE = process.env.NEXT_PUBLIC_BIT_PHONE || '';
const PAYBOX_PHONE = process.env.NEXT_PUBLIC_PAYBOX_PHONE || '';

export default function CartDrawer({ isOpenForOrders, cutoffLabel }: { isOpenForOrders: boolean; cutoffLabel: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const { items, remove, clear } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<null | 'BIT' | 'PAYBOX' | 'CASH'>(null);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const fee = method === 'DELIVERY' && city.trim().toLowerCase() === 'yad binyamin' ? 20 : 0;
  const total = (promoApplied ? subtotal - promoApplied.discount : subtotal) + fee;

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#cart') setOpen(true);
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('email') || ''),
      city,
      street,
      apt: String(form.get('apt') || ''),
      notes: String(form.get('notes') || ''),
      method,
      deliverySlot: String(form.get('deliverySlot') || ''),
      marketingOptIn: Boolean(form.get('marketingOptIn')),
      promotionCode: promoApplied?.code || undefined,
      paymentMethod,
      items: items.map(i => ({ key: i.key, name: i.name, flavor: i.flavor, qty: i.qty })),
    };
    try {
      setLoading(true);
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      // client-side analytics (server logs are also recorded)
      const itemsCount = items.reduce((n, i) => n + i.qty, 0);
      track({ name: 'order_placed', order: { id: data.id, code: data.code, total: subtotal, items: itemsCount } });
      clear();
      setOpen(false);
      router.push(`/order/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Could not place order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function applyPromo() {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied({ discount: data.discount, code: promoCode });
      } else {
        alert('Invalid or expired promotion code');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to validate promotion code');
    }
  }

  return (
    <div>
      <button 
        data-testid="open-cart" 
        className="fixed bottom-6 right-6 bg-gradient-to-r from-salmon-500 to-salmon-600 hover:from-salmon-600 hover:to-salmon-700 text-white rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 z-40 flex items-center gap-2 font-medium"
        onClick={() => setOpen(true)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        Cart ({items.length})
        {items.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {items.reduce((sum, item) => sum + item.qty, 0)}
          </div>
        )}
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/20" aria-hidden onClick={() => setOpen(false)} />
      )}
      <aside className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Shopping cart">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 id="cart-title" className="text-xl font-bold text-gray-900">Your Order</h2>
          </div>
          <button 
            onClick={() => setOpen(false)} 
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 overflow-y-auto h-[calc(100%-320px)]" role="region" aria-labelledby="cart-title">
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some delicious salmon to get started!</p>
            </div>
          )}
          {items.map((i, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-salmon-200 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{i.name}</div>
                  {i.flavor && <div className="text-sm text-gray-600 mt-1">{i.flavor}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Qty:</span>
                    <span className="bg-white px-2 py-1 rounded-lg text-sm font-medium">{i.qty}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-lg text-gray-900">₪{i.qty * i.price}</div>
                  <button 
                    className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors duration-200 mt-1" 
                    onClick={() => remove(idx)} 
                    aria-label={`Remove ${i.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 border-t px-6 py-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₪{subtotal}</span>
              </div>
              {promoApplied && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Discount ({promoApplied.code})</span>
                  <span>-₪{promoApplied.discount}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-bold text-lg border-t pt-2 text-gray-900">
                <span>Total</span>
                <span>₪{total}</span>
              </div>
            </div>
          </div>
          
          {/* Promo Code */}
          {!promoApplied && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">Promo Code</h4>
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="form-input flex-1 text-sm"
                  aria-label="Promotion code"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="btn-secondary text-sm px-4"
                  aria-label="Apply promotion code"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
          
          {/* Checkout Form */}
          <form className="space-y-4" onSubmit={submit} role="form" aria-label="Checkout form">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="space-y-3">
                <input required name="name" placeholder="Full name" className="form-input" aria-label="Full name" tabIndex={1} />
                <input required name="phone" placeholder="Phone number" className="form-input" aria-label="Phone number" tabIndex={2} />
                <input name="email" type="email" placeholder="Email (optional)" className="form-input" aria-label="Email address" tabIndex={3} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-4">Delivery Information</h4>
              <div className="space-y-3">
                <select name="deliverySlot" className="form-select" aria-label="Delivery time window" tabIndex={4}>
                  <option value="">Select Friday delivery window</option>
                  <option value="09:00-12:00">09:00-12:00</option>
                  <option value="12:00-15:00">12:00-15:00</option>
                </select>
                <input name="city" placeholder="City" className="form-input" aria-label="City" tabIndex={5} />
                <input name="street" placeholder="Street address" className="form-input" aria-label="Street address" tabIndex={6} />
                <input name="apt" placeholder="Apt/Floor/Entrance" className="form-input" aria-label="Apartment, floor, or entrance details" tabIndex={7} />
                <textarea name="notes" placeholder="Special delivery instructions" className="form-input resize-none" rows={3} aria-label="Special delivery instructions" tabIndex={8} />
              </div>
            </div>
            
            {!isOpenForOrders && (
              <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800">Ordering Closed</p>
                    <p className="text-sm text-amber-700 mt-1">Orders placed now will be for next Friday. Cutoff: {cutoffLabel}.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod==='CASH'} onChange={() => setPaymentMethod('CASH')} />
                  <span>Cash</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="paymentMethod" value="BIT" checked={paymentMethod==='BIT'} onChange={() => setPaymentMethod('BIT')} />
                  <span>Bit</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="paymentMethod" value="PAYBOX" checked={paymentMethod==='PAYBOX'} onChange={() => setPaymentMethod('PAYBOX')} />
                  <span>PayBox</span>
                </label>
              </div>
              {(paymentMethod==='BIT' && BIT_PHONE) && (
                <div className="mt-3 text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                  <div>After placing your order, send ₪{total} via Bit to <span className="font-medium">{BIT_PHONE}</span>.</div>
                  <div>Memo: your name or order code.</div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText(BIT_PHONE)}>Copy phone</button>
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText('Order payment')}>Copy memo</button>
                  </div>
                </div>
              )}
              {(paymentMethod==='PAYBOX' && PAYBOX_PHONE) && (
                <div className="mt-3 text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                  <div>After placing your order, send ₪{total} via PayBox to <span className="font-medium">{PAYBOX_PHONE}</span>.</div>
                  <div>Memo: your name or order code.</div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText(PAYBOX_PHONE)}>Copy phone</button>
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText('Order payment')}>Copy memo</button>
                  </div>
                </div>
              )}
              {!paymentMethod && <p className="mt-2 text-xs text-red-600">Please select a payment method.</p>}
            </div>

            <div className="space-y-3">
              <button 
                disabled={items.length === 0 || loading || !paymentMethod} 
                type="submit" 
                className="w-full btn-salmon text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                tabIndex={9}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </div>
                ) : (
                  `Place Order - ₪${total}`
                )}
              </button>
              <button 
                type="button" 
                onClick={clear} 
                className="w-full btn-secondary py-3" 
                tabIndex={10} 
                aria-label="Clear all items from cart"
              >
                Clear Cart
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}
