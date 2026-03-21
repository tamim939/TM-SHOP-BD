import React from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, categories, productsLoaded, categoriesLoaded } = useStore();
  
  if (!categoriesLoaded || !productsLoaded) {
    return (
      <div className="container pt-24 pb-12">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 w-64 bg-gray-200 mx-auto mb-4 rounded" />
          <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.slug === slug);
  
  const filteredProducts = products.filter(p => {
    if (!category) return false;
    return p.category === category.slug || p.category === category.name;
  });

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="container pt-12 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-5xl font-bold uppercase tracking-tight mb-4 text-red-600">{category.name}</h1>
        <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full"></div>
        <p className="mt-4 text-gray-500 uppercase tracking-widest text-sm">Showing all products in {category.name}</p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
