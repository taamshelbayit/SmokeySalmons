"use client";

import { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/components/cart-state';
import { track } from '@/lib/analytics';

export default function ProductCard({ product }: { product: { key: string; name: string; desc: string; price: number } }) {
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState('Classic Dill & Lemon');
  const { add } = useCart();

  // Product images mapping (placeholder for now)
  const productImages = {
    whole: '🐟',
    half: '🥩',
    quarter: '🍽️',
    taster: '🍱'
  };

  const productIcon = productImages[product.key as keyof typeof productImages] || '🐟';

  return (
    <div className="card card-hover group" data-testid={`product-card-${product.key}`}>
      <div className="p-6 flex flex-col h-full">
        {/* Product Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white text-xl">{productIcon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-salmon-600 transition-colors duration-200">
                {product.name}
              </h3>
              <div className="flex items-center space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-400 fill-current" />
                ))}
                <span className="text-xs text-gray-500 ml-1">(4.9)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">₪{product.price}</div>
            <div className="text-xs text-gray-500">per portion</div>
          </div>
        </div>

        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-6 leading-relaxed flex-1">
          {product.desc}
        </p>

        {/* Flavor Selection */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-700">Choose Flavor</label>
          <select 
            aria-label="Flavor" 
            className="form-select text-sm" 
            value={flavor} 
            onChange={(e) => setFlavor(e.target.value)}
          >
            <option>Classic Dill & Lemon</option>
            <option>Maple Glaze</option>
            <option>Harissa Heat</option>
            <option>Black Pepper</option>
          </select>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
            <input 
              aria-label="Quantity" 
              type="number" 
              min={1} 
              max={10}
              value={qty} 
              onChange={(e) => setQty(parseInt(e.target.value || '1'))} 
              className="form-input text-center font-medium"
            />
          </div>
          <button 
            onClick={() => { 
              const item = { key: product.key, name: product.name, flavor, qty, price: product.price }; 
              add(item); 
              track({ name: 'add_to_cart', item }); 
            }} 
            className="btn-salmon flex-2 inline-flex items-center justify-center gap-2 min-w-[120px]"
          >
            <ShoppingCart size={16} /> 
            Add to Cart
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Fresh delivery
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Premium quality
          </span>
        </div>
      </div>
    </div>
  );
}
