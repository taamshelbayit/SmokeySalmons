"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart-state';
import { track } from '@/lib/analytics';
import { OrderInput } from '@/lib/validation';
import { z } from 'zod';

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
  const [city, setCity] = useState('Yad Binyamin');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [notes, setNotes] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<null | 'BIT' | 'PAYBOX' | 'CASH'>(null);
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberInfo, setRememberInfo] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items]);
  const fee = useMemo(() => method === 'DELIVERY' && city.trim().toLowerCase() === 'yad binyamin' ? 20 : 0, [method, city]);
  const total = useMemo(() => (promoApplied ? subtotal - promoApplied.discount : subtotal) + fee, [promoApplied, subtotal, fee]);

  useEffect(() => {
    if (items.length === 0 && !orderSubmitted) {
      // Nothing to checkout - but don't redirect if we just submitted an order
      router.replace('/');
    }
  }, [items.length, router, orderSubmitted]);

  // Load saved contact info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smokey-contact-info');
      if (saved) {
        try {
          const { name: savedName, phone: savedPhone, email: savedEmail } = JSON.parse(saved);
          if (savedName) setName(savedName);
          if (savedPhone) setPhone(savedPhone);
          if (savedEmail) setEmail(savedEmail);
          setRememberInfo(true);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    }
  }, []);

  // Save contact info when remember is checked
  useEffect(() => {
    if (typeof window !== 'undefined' && rememberInfo && name && phone && email) {
      localStorage.setItem('smokey-contact-info', JSON.stringify({ name, phone, email }));
    } else if (typeof window !== 'undefined' && !rememberInfo) {
      localStorage.removeItem('smokey-contact-info');
    }
  }, [rememberInfo, name, phone, email]);

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

  function validateStep(step: number): boolean {
    const newErrors: Record<string, string> = {};
    
    if (step >= 1) {
      // Contact validation
      if (!name.trim()) newErrors.name = 'Name is required';
      else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
      
      if (!phone.trim()) newErrors.phone = 'Phone is required';
      else if (phone.trim().length < 5) newErrors.phone = 'Phone must be at least 5 characters';
      
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
    }
    
    if (step >= 2) {
      // Delivery validation
      if (method === 'DELIVERY') {
        if (!city.trim()) newErrors.city = 'City is required for delivery';
        else if (city.trim().toLowerCase() !== 'yad binyamin') {
          newErrors.city = 'Delivery is only available in Yad Binyamin';
        }
        if (!street.trim()) newErrors.street = 'Street address is required for delivery';
      }
    }
    
    if (step >= 3) {
      // Payment validation
      if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  function nextStep() {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }
  
  function prevStep() {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    
    // Final validation
    if (!validateStep(3)) return;

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
      setErrors({ submit: 'Could not place order. Please check your details and try again.' });
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { number: 1, title: 'Contact', description: 'Your details' },
    { number: 2, title: 'Delivery', description: 'Method & address' },
    { number: 3, title: 'Payment', description: 'How you\'ll pay' },
    { number: 4, title: 'Review', description: 'Confirm order' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      
      {/* Progress Stepper */}
      <div className="mb-8" data-testid="stepper">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div data-testid={`step-${step.number}`} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-salmon-500 border-salmon-500 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
                {/* Expose the step title for Cypress 'contain' assertions while keeping UI unchanged */}
                <span className="sr-only">{step.title}</span>
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-salmon-600' : 'text-gray-500'
                }`}>{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-salmon-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <form onSubmit={submitOrder} className="lg:col-span-2 space-y-6">
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-medium text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input 
                    value={name} 
                    onChange={e=>setName(e.target.value)} 
                    name="name" 
                    placeholder="Full name" 
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`} 
                    aria-label="Full name" 
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input 
                    value={phone} 
                    onChange={e=>setPhone(e.target.value)} 
                    name="phone" 
                    placeholder="Phone number" 
                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`} 
                    aria-label="Phone number" 
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <input 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    className={`form-input ${errors.email ? 'border-red-500' : ''}`} 
                    aria-label="Email address" 
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      checked={rememberInfo} 
                      onChange={e=>setRememberInfo(e.target.checked)} 
                      className="rounded border-gray-300" 
                    />
                    Remember my contact information for future orders
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Information */}
          {currentStep === 2 && (
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
              
              {method === 'DELIVERY' && city.trim() && city.trim().toLowerCase() !== 'yad binyamin' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Delivery not available</p>
                      <p>We currently only deliver to Yad Binyamin. Please select pickup or enter "Yad Binyamin" as your city.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Window *</label>
                  <select value={deliverySlot} onChange={(e)=>setDeliverySlot(e.target.value)} name="deliverySlot" className="form-select" aria-label="Delivery time window">
                    <option value="">Select Friday delivery window</option>
                    <option value="09:00-12:00">09:00-12:00</option>
                    <option value="12:00-15:00">12:00-15:00</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <select
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-select"
                      disabled={method === 'PICKUP'}
                      required={method === 'DELIVERY'}
                    >
                      <option value="Yad Binyamin">Yad Binyamin</option>
                      <option value="More to follow" disabled>More to follow</option>
                    </select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <input 
                      value={street} 
                      onChange={e=>setStreet(e.target.value)} 
                      name="street" 
                      placeholder="Street address" 
                      className={`form-input ${errors.street ? 'border-red-500' : ''}`} 
                      aria-label="Street address" 
                      disabled={method === 'PICKUP'}
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                  </div>
                </div>
                <input value={apt} onChange={e=>setApt(e.target.value)} name="apt" placeholder="Apt/Floor/Entrance" className="form-input" aria-label="Apartment, floor, or entrance details" disabled={method === 'PICKUP'} />
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
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
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
              {errors.paymentMethod && <p className="text-red-500 text-sm mt-2">{errors.paymentMethod}</p>}
              {paymentMethod==='BIT' && (
                <div className="mt-3 text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                  <div>After placing your order, send ₪{total} via Bit to <span className="font-medium">{BIT_PHONE}</span>.</div>
                  <div>Memo: your name or order code.</div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText(BIT_PHONE)}>Copy phone</button>
                    <button type="button" className="btn-secondary !text-xs" onClick={()=>navigator.clipboard?.writeText('Order payment')}>Copy memo</button>
                  </div>
                </div>
              )}
              {paymentMethod==='PAYBOX' && (
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
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-medium text-gray-900 mb-4">Review Your Order</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Contact:</span> {name} ({phone}) - {email}
                </div>
                <div>
                  <span className="font-medium">Method:</span> {method === 'DELIVERY' ? `Delivery to ${city}, ${street}` : 'Pickup from Yad Binyamin'}
                  {deliverySlot && <span className="ml-2">({deliverySlot})</span>}
                </div>
                <div>
                  <span className="font-medium">Payment:</span> {paymentMethod}
                </div>
                {notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {notes}
                  </div>
                )}
              </div>
              {errors.submit && <p className="text-red-500 text-sm mt-3">{errors.submit}</p>}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Link href="/" className="btn-secondary px-4 py-3">Continue Shopping</Link>
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary px-4 py-3">
                  Back
                </button>
              )}
            </div>
            <div>
              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="btn-salmon px-6 py-3">
                  Next
                </button>
              ) : (
                <button 
                  disabled={items.length === 0 || loading} 
                  type="submit" 
                  className="btn-salmon px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Placing Order…' : `Place Order - ₪${total}`}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Right: Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-gray-900 mb-3">Order Summary</h2>
            <ul className="divide-y">
              {items.map((i, idx) => (
                <li key={idx} data-testid="cart-item" className="py-2 flex items-center justify-between">
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
              {!promoApplied && (
                <div className="pt-2">
                  <div className="flex w-full items-stretch gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="form-input flex-1 min-w-0 text-sm"
                      aria-label="Promotion code"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="btn-secondary text-sm px-3 py-2 shrink-0"
                      aria-label="Apply promotion code"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
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
                <span data-testid="order-total">₪{total}</span>
              </div>
            </div>
          </div>

          {/* Removed duplicate Promo Code card; promo input now appears only within Order Summary */}
        </div>
      </div>
    </div>
  );
}
