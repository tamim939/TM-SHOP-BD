import { Home, Heart, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function BottomNav() {
  const location = useLocation();
  const { cart, wishlist } = useStore();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 h-16">
      <div className="grid grid-cols-5 h-full">
        {/* Wishlist */}
        <Link to="/wishlist" className="flex flex-col items-center justify-center relative">
          <div className="relative">
            <Heart size={20} className={location.pathname === '/wishlist' ? 'text-red-600' : 'text-gray-400'} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 font-bold ${location.pathname === '/wishlist' ? 'text-red-600' : 'text-gray-400'}`}>Wishlist</span>
        </Link>

        {/* Orders */}
        <Link to="/orders" className="flex flex-col items-center justify-center">
          <ClipboardList size={20} className={location.pathname === '/orders' ? 'text-red-600' : 'text-gray-400'} />
          <span className={`text-[10px] mt-1 font-bold ${location.pathname === '/orders' ? 'text-red-600' : 'text-gray-400'}`}>Orders</span>
        </Link>

        {/* Home - Floating in Center */}
        <Link to="/" className="flex flex-col items-center justify-center relative">
          <div className="absolute -top-6 p-3 rounded-full border-4 border-white shadow-lg bg-red-600 text-white transition-transform active:scale-95">
            <Home size={24} />
          </div>
          <span className="text-[10px] mt-6 font-bold text-gray-400">Home</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex flex-col items-center justify-center relative">
          <div className="relative">
            <ShoppingCart size={20} className={location.pathname === '/cart' ? 'text-red-600' : 'text-gray-400'} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-1 font-bold ${location.pathname === '/cart' ? 'text-red-600' : 'text-gray-400'}`}>Cart</span>
        </Link>

        {/* Profile */}
        <Link to="/profile" className="flex flex-col items-center justify-center">
          <User size={20} className={location.pathname === '/profile' ? 'text-red-600' : 'text-gray-400'} />
          <span className={`text-[10px] mt-1 font-bold ${location.pathname === '/profile' ? 'text-red-600' : 'text-gray-400'}`}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
