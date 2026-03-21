import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  type: 'new' | 'hot';
  viewAllLink: string;
}

export default function ProductSection({ title, type, viewAllLink }: ProductSectionProps) {
  const { products } = useStore();
  const filteredProducts = products.filter(p => type === 'new' ? p.isNew : p.isHot);

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight">{title}</h2>
            <div className="w-12 h-1 bg-red-600 mt-2"></div>
          </div>
          <a 
            href={viewAllLink} 
            className="flex items-center space-x-1 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <span>See All</span>
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
