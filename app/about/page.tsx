export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-3xl">🐟</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">About Smokey Salmons</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We make calm, simple, trustworthy smoked salmon for Shabbat. 
            Minimal ingredients, maximum care.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6 animate-slide-in">
            <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Born from a passion for authentic flavors and traditional smoking methods, 
              Smokey Salmons began as a small family operation dedicated to bringing 
              premium smoked salmon to Shabbat tables across the community.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Every fish is hand-selected for quality, then carefully prepared using 
              time-honored techniques that have been passed down through generations. 
              We believe in simplicity – letting the natural flavors shine through 
              with minimal but perfect seasoning.
            </p>
          </div>
          <div className="bg-gradient-to-br from-salmon-100 to-salmon-200 rounded-2xl p-8 text-center animate-fade-in">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24-Hour Process</h3>
            <p className="text-gray-700">
              Each salmon undergoes our signature 24-hour cold smoking process, 
              ensuring perfect texture and flavor development.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🌊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sustainability</h3>
              <p className="text-gray-600">
                We source only from sustainable fisheries, ensuring our oceans 
                remain healthy for future generations.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quality</h3>
              <p className="text-gray-600">
                Every piece is inspected by hand. We never compromise on quality, 
                ensuring each delivery meets our exacting standards.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-salmon-500 to-salmon-600 rounded-xl flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Community</h3>
              <p className="text-gray-600">
                We're proud to serve families across our community, bringing 
                people together around beautiful Shabbat tables.
              </p>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-white p-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-salmon-500 rounded-full flex items-center justify-center mx-auto text-xl">1</div>
              <h4 className="font-semibold">Selection</h4>
              <p className="text-gray-300 text-sm">Hand-picked premium salmon from trusted suppliers</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-salmon-500 rounded-full flex items-center justify-center mx-auto text-xl">2</div>
              <h4 className="font-semibold">Preparation</h4>
              <p className="text-gray-300 text-sm">Careful filleting and seasoning with our signature blend</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-salmon-500 rounded-full flex items-center justify-center mx-auto text-xl">3</div>
              <h4 className="font-semibold">Smoking</h4>
              <p className="text-gray-300 text-sm">24-hour cold smoking process for perfect flavor</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-salmon-500 rounded-full flex items-center justify-center mx-auto text-xl">4</div>
              <h4 className="font-semibold">Delivery</h4>
              <p className="text-gray-300 text-sm">Fresh delivery every Friday, ready for Shabbat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
