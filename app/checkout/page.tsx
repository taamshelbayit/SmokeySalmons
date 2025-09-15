"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-state';
import { track } from '@/lib/analytics';

const BIT_PHONE = process.env.NEXT_PUBLIC_BIT_PHONE || '';
const PAYBOX_PHONE = process.env.NEXT_PUBLIC_PAYBOX_PHONE || '';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [method, setMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [notes, setNotes] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<null | 'BIT' | 'PAYBOX' | 'CASH'>(null);
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items]);
  const fee = useMemo(() => method === 'DELIVERY' && city.trim().toLowerCase() === 'yad binyamin' ? 20 : 0, [method, city]);
  const total = useMemo(() => (promoApplied ? subtotal - promoApplied.discount : subtotal) + fee, [promoApplied, subtotal, fee]);

  useEffect(() => {
    if (items.length === 0 && !orderSubmitted) {
      // Nothing to checkout - but don't redirect if we just submitted an order
      router.replace('/');
    }
  }, [items.length, router, orderSubmitted]);

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

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentMethod) return alert('Please choose a payment method');
    if (method === 'DELIVERY' && (!city.trim() || !street.trim())) return alert('City and street are required for delivery');

    const payload = {
      name,
      phone,
      email,
      city,
      street,
      apt,
      notes,
      method,
      deliverySlot,
      marketingOptIn,
      promotionCode: promoApplied?.code || undefined,
      paymentMethod,
      items: items.map(i => ({ key: i.key, name: i.name, flavor: i.flavor, qty: i.qty })),
    };

    try {
      setLoading(true);
      setOrderSubmitted(true); // Prevent redirect to home when cart clears
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      const itemsCount = items.reduce((n, i) => n + i.qty, 0);
      track({ name: 'order_placed', order: { id: data.id, code: data.code, total: subtotal, items: itemsCount } });
      clear(); // Clear cart first
      router.push(`/order/${data.id}`); // Then navigate
    } catch (err) {
      console.error(err);
      alert('Could not place order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <form onSubmit={submitOrder} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required value={name} onChange={e=>setName(e.target.value)} name="name" placeholder="Full name" className="form-input" aria-label="Full name" />
              <input required value={phone} onChange={e=>setPhone(e.target.value)} name="phone" placeholder="Phone number" className="form-input" aria-label="Phone number" />
              <input required value={email} onChange={e=>setEmail(e.target.value)} name="email" type="email" placeholder="Email" className="form-input md:col-span-2" aria-label="Email address" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-4">Delivery or Pickup</h2>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-3">
                <input type="radio" name="method" value="DELIVERY" checked={method==='DELIVERY'} onChange={()=>setMethod('DELIVERY')} />
                <span>Delivery in Yad Binyamin (₪20)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="method" value="PICKUP" checked={method==='PICKUP'} onChange={()=>setMethod('PICKUP')} />
                <span>Collection from Yad Binyamin (Free)</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={deliverySlot} onChange={(e)=>setDeliverySlot(e.target.value)} name="deliverySlot" className="form-select" aria-label="Delivery time window">
                <option value="">Select Friday delivery window</option>
                <option value="09:00-12:00">09:00-12:00</option>
                <option value="12:00-15:00">12:00-15:00</option>
              </select>
              <input value={city} onChange={e=>setCity(e.target.value)} name="city" placeholder="City" className="form-input" aria-label="City" required={method==='DELIVERY'} />
              <input value={street} onChange={e=>setStreet(e.target.value)} name="street" placeholder="Street address" className="form-input" aria-label="Street address" required={method==='DELIVERY'} />
              <input value={apt} onChange={e=>setApt(e.target.value)} name="apt" placeholder="Apt/Floor/Entrance" className="form-input" aria-label="Apartment, floor, or entrance details" />
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} name="notes" placeholder="Special delivery instructions" className="form-input resize-none md:col-span-2" rows={3} aria-label="Special delivery instructions" />
            </div>
            <div className="mt-3 text-sm text-gray-700">
              {method==='DELIVERY' ? (
                <div>
                  Delivery fee: <span className="font-semibold">₪{fee}</span> {city ? `(${city})` : ''}
                </div>
              ) : (
                <div>
                  Pickup selected — <span className="font-semibold">Free</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-3">Payment Method</h2>
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
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="btn-secondary px-4 py-3">Continue Shopping</Link>
            <button 
              disabled={items.length === 0 || loading || !paymentMethod || !name || !phone || !email || (method==='DELIVERY' && (!city || !street))} 
              type="submit" 
              className="btn-salmon px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Placing Order…' : `Place Order - ₪${total}`}
            </button>
          </div>
        </form>

        {/* Right: Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-3">Order Summary</h2>
            <ul className="divide-y">
              {items.map((i, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-800">{i.name}{i.flavor ? ` (${i.flavor})` : ''} × {i.qty}</span>
                  <span className="text-sm font-medium">₪{i.qty * i.price}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₪{subtotal}</span>
              </div>
              {promoApplied && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount ({promoApplied.code})</span>
                  <span>-₪{promoApplied.discount}</span>
                </div>
              )}
              {fee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery fee</span>
                  <span>₪{fee}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold text-base">
                <span>Total</span>
                <span>₪{total}</span>
              </div>
            </div>
          </div>

          {!promoApplied && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Promo Code</h3>
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
        </div>
      </div>
    </div>
  );
}
