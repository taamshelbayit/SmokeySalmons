import Link from 'next/link';
import { BRAND_NAME } from '@/lib/config';

export default function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-soft">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <span className="text-white font-bold text-sm">🐟</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/about" 
              className="px-4 py-2 text-gray-700 hover:text-salmon-600 hover:bg-salmon-50 rounded-lg transition-all duration-200 font-medium"
            >
              About
            </Link>
            <Link 
              href="/how-we-make-it" 
              className="px-4 py-2 text-gray-700 hover:text-salmon-600 hover:bg-salmon-50 rounded-lg transition-all duration-200 font-medium"
            >
              How We Make It
            </Link>
            <Link 
              href="/loyalty" 
              className="px-4 py-2 text-gray-700 hover:text-salmon-600 hover:bg-salmon-50 rounded-lg transition-all duration-200 font-medium"
            >
              Loyalty
            </Link>
            <Link 
              href="/contact" 
              className="px-4 py-2 text-gray-700 hover:text-salmon-600 hover:bg-salmon-50 rounded-lg transition-all duration-200 font-medium"
            >
              Contact
            </Link>
            <Link 
              href="/admin" 
              className="ml-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 text-gray-600 hover:text-salmon-600 hover:bg-salmon-50 rounded-lg transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
