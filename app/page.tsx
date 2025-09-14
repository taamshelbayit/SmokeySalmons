import Countdown from '@/components/Countdown';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import { getCutoffInfo } from '@/lib/cutoff';
import { BRAND_NAME, BRAND_SLOGAN } from '@/lib/config';

export const revalidate = 60; // refresh countdown/top-of-hour

export default async function HomePage() {
  const cutoff = await getCutoffInfo();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-salmon-50">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-salmon-600 bg-clip-text text-transparent leading-tight">
                {BRAND_NAME}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                {BRAND_SLOGAN}
              </p>
              <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                Premium smoked salmon, crafted with care and delivered fresh to your door. 
                Perfect for Shabbat tables and special occasions.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Countdown cutoff={cutoff} />
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="text-center space-y-2 animate-slide-in">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white text-xl">🐟</span>
                </div>
                <h3 className="font-semibold text-gray-900">Premium Quality</h3>
                <p className="text-sm text-gray-600">Hand-selected, sustainably sourced salmon</p>
              </div>
              <div className="text-center space-y-2 animate-slide-in" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-salmon-500 to-salmon-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white text-xl">🔥</span>
                </div>
                <h3 className="font-semibold text-gray-900">Charcoal‑Fired Smoking</h3>
                <p className="text-sm text-gray-600">Quality lump charcoal with a variety of wood chunks</p>
              </div>
              <div className="text-center space-y-2 animate-slide-in" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white text-xl">🚚</span>
                </div>
                <h3 className="font-semibold text-gray-900">Fresh Delivery</h3>
                <p className="text-sm text-gray-600">Delivered fresh every Friday for Shabbat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Our Premium Selection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our carefully curated selection of smoked salmon, 
              each prepared with traditional methods and premium ingredients.
            </p>
          </div>
          
          <ProductGrid />
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-salmon-600">100%</div>
              <div className="text-sm text-gray-600">Fresh Guarantee</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-salmon-600">Charcoal‑Fired</div>
              <div className="text-sm text-gray-600">Smoked as long as it takes with a variety of wood chunks</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-salmon-600">500+</div>
              <div className="text-sm text-gray-600">Happy Families</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-salmon-600">5★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <CartDrawer isOpenForOrders={cutoff.isOpen} cutoffLabel={cutoff.label} />
    </div>
  );
}
