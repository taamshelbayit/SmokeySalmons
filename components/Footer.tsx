import Link from 'next/link';
import { BRAND_NAME } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">🐟</span>
              </div>
              <span className="font-bold text-xl text-white">{BRAND_NAME}</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Premium smoked salmon, crafted with care for your Shabbat table. 
              Slow-smoked perfection, delivered fresh to your door.
            </p>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get weekly deals and fresh updates</p>
              <form className="flex gap-2">
                <input 
                  aria-label="Email address" 
                  type="email" 
                  placeholder="your@email.com" 
                  className="form-input flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-salmon-500 focus:border-salmon-500"
                />
                <button className="btn-salmon whitespace-nowrap">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-400">We respect your privacy and never spam.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link 
                href="/about" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                About Us
              </Link>
              <Link 
                href="/how-we-make-it" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                How We Make It
              </Link>
              <Link 
                href="/loyalty" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                Loyalty Program
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <div className="space-y-3">
              <Link 
                href="/terms" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                Terms & Conditions
              </Link>
              <Link 
                href="/privacy" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/admin" 
                className="block text-gray-300 hover:text-salmon-400 transition-colors duration-200"
              >
                Admin Portal
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Questions? We're here to help.
              </p>
              <p className="text-salmon-400 font-medium mt-1">
                orders@smokeysal.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 {BRAND_NAME}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2 sm:mt-0">
            Made with ❤️ for Shabbat tables everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
