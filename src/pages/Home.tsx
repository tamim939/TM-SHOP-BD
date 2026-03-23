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
    return products.filter(p => !p.category || p.category === 'none' || p.category === '');
  }, [products, productsLoaded]);

  const sortedCategories = useMemo(() => {
    if (!categoriesLoaded) return [];
    return categories;
  }, [categories, categoriesLoaded]);

  return (
    <div className="">
      <Hero />
      
      <CategorySection />

      {/* Categorized Product Sections */}
      {sortedCategories.map(category => {
        const categoryProducts = products.filter(p => 
          p.category === category.slug || 
          p.category === category.name ||
          (p.category && p.category.toLowerCase() === category.name.toLowerCase())
        );
        
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="pt-4 pb-4 border-b border-gray-100 bg-gray-50/30">
            <div className="container">
              <div className="mb-3 flex items-center justify-between">
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

      {/* Uncategorized Products */}
      {uncategorizedProducts.length > 0 && (
        <section className="pt-4 pb-12 bg-white">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Featured Products</h2>
                <div className="w-12 h-1 bg-red-600 mt-2"></div>
              </div>
              <Link 
                to="/shop" 
                className="text-red-600 font-bold flex items-center space-x-1 hover:underline text-sm"
              >
                <span>Shop All</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {uncategorizedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
