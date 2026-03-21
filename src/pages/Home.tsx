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
      
      {/* Notice Bar */}
      <div className="bg-red-600 py-2 overflow-hidden relative">
        <div className="whitespace-nowrap animate-marquee inline-block">
          <span className="text-sm md:text-base font-bold text-white px-12">
            {settings.sliderTitle || 'Check out our new collection!'}
          </span>
          <span className="text-sm md:text-base font-bold text-white px-12">
            {settings.sliderTitle || 'Check out our new collection!'}
          </span>
          <span className="text-sm md:text-base font-bold text-white px-12">
            {settings.sliderTitle || 'Check out our new collection!'}
          </span>
        </div>
      </div>
      
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

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4 p-6 bg-red-50 rounded-2xl">
              <div className="bg-red-600 p-3 rounded-xl text-white">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold">Fast Delivery</h3>
                <p className="text-sm text-gray-500">Home delivery all over Bangladesh</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-red-50 rounded-2xl">
              <div className="bg-red-600 p-3 rounded-xl text-white">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold">Secure Payment</h3>
                <p className="text-sm text-gray-500">Cash on delivery available</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-6 bg-red-50 rounded-2xl">
              <div className="bg-red-600 p-3 rounded-xl text-white">
                <Star size={24} />
              </div>
              <div>
                <h3 className="font-bold">Best Quality</h3>
                <p className="text-sm text-gray-500">100% Original Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
