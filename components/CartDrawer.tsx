"use client";

import { useEffect, useState } from 'react';
import { useCart } from './cart-state';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';

export default function CartDrawer({ isOpenForOrders, cutoffLabel }: { isOpenForOrders: boolean; cutoffLabel: string }) {
  const [open, setOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const { items, remove, clear } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const total = promoApplied ? subtotal - promoApplied.discount : subtotal;

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#cart') setOpen(true);
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  // Checkout now happens on the dedicated /checkout page

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
      <aside className={`fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`} aria-label="Shopping cart">
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
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4 space-y-4" role="region" aria-labelledby="cart-title">
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
          {/* Proceed to Checkout */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            {!isOpenForOrders && (
              <div role="alert" className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                Orders placed now will be for next Friday. Cutoff: {cutoffLabel}.
              </div>
            )}
            <button
              disabled={items.length === 0}
              onClick={() => { setOpen(false); router.push('/checkout'); }}
              className="w-full btn-salmon text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
            <button 
              type="button" 
              onClick={clear} 
              className="w-full btn-secondary py-3" 
              aria-label="Clear all items from cart"
            >
              Clear Cart
            </button>
          </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
