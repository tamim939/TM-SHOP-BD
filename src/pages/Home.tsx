import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import AutoScrollRow from '../components/AutoScrollRow';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Star, Shield, Truck, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

export default function Home() {
  const { products, categories, settings, productsLoaded, categoriesLoaded } = useStore();

  const uncategorizedProducts = useMemo(() => {
    if (!productsLoaded) return [];
    // Show all products that don't have a category
    return products.filter(p => !p.category || p.category === 'none' || p.category === '').sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [products, productsLoaded]);

  const sortedCategories = useMemo(() => {
    if (!categoriesLoaded) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, categoriesLoaded]);

  return (
    <div className="">
      <Hero />
      
      <CategorySection />

      {/* Skeletons for sections if not loaded */}
      {(!productsLoaded || !categoriesLoaded) && (
        <div className="space-y-12 py-12">
          {[1, 2].map(i => (
            <div key={i} className="container">
              <div className="mb-8 flex items-center justify-between animate-pulse">
                <div className="w-48 h-8 bg-gray-100 rounded" />
                <div className="w-20 h-6 bg-gray-100 rounded" />
              </div>
              <div className="flex space-x-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="min-w-[150px] aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categorized Product Sections */}
      {sortedCategories.map(category => {
        const categoryProducts = products.filter(p => 
          p.category === category.slug || 
          p.category === category.name ||
          (p.category && p.category.toLowerCase() === category.name.toLowerCase())
        );
        
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="py-12 border-t border-gray-100 bg-gray-50/30">
            <div className="container">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">{category.name}</h2>
                  <div className="w-12 h-1 bg-red-600 mt-2"></div>
                </div>
                <Link 
                  to={`/category/${category.slug}`} 
                  className="text-red-600 font-bold flex items-center space-x-1 hover:underline text-sm"
                >
                  <span>View All</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <AutoScrollRow>
                {categoryProducts.map((product) => (
                  <div key={product.id} className="min-w-[130px] max-w-[150px] md:min-w-[180px] lg:min-w-[200px] flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </AutoScrollRow>
            </div>
          </section>
        );
      })}
    </div>
  );
}
