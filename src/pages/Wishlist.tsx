import React from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, products } = useStore();
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight flex items-center space-x-3">
              <Heart className="text-red-500" fill="currentColor" />
              <span>My Wishlist</span>
            </h1>
            <div className="w-12 h-1 bg-red-600 mt-2"></div>
          </div>
          <p className="text-gray-500 font-medium">{wishlistProducts.length} Products</p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">You can save your favorite products here.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              <ShoppingBag size={20} />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
