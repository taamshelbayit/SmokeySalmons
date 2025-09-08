import ProductCard from './ProductCard';

const products = [
  { 
    key: 'whole', 
    name: 'Whole Salmon', 
    desc: 'Complete whole fish expertly cut into perfect portions. Ideal for large families or special occasions.', 
    price: 240 
  },
  { 
    key: 'half', 
    name: 'Half Salmon', 
    desc: 'Premium front half portion with the finest cuts. Perfect for medium-sized gatherings.', 
    price: 130 
  },
  { 
    key: 'quarter', 
    name: 'Quarter Portion', 
    desc: 'Standard back quarter with rich, flavorful meat. Great for smaller families or intimate dinners.', 
    price: 75 
  },
  { 
    key: 'taster', 
    name: 'Taster Platter', 
    desc: 'Curated selection of 3-4 signature flavors in perfect tasting portions. Discover your favorite!', 
    price: 85 
  },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8">
      {products.map((p, index) => (
        <div 
          key={p.key} 
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
