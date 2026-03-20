import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.sizes ? product.sizes[0] : 'Standard',
      image: product.image
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isNew && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>
          )}
          {product.discount && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">-{product.discount}%</span>
          )}
        </div>

        {/* Actions at top right */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          <button 
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full transition-all duration-300 shadow-sm ${
              isInWishlist(product.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm text-emerald-600 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={handleAddToCart}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded flex items-center justify-center space-x-2 text-sm font-bold transition-colors"
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      <div className="p-3 text-center">
        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="text-xs lg:text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-base font-bold text-emerald-600">Tk {product.price}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">Tk {product.oldPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
