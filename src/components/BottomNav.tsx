import { Home, MessageSquare, Heart, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function BottomNav() {
  const location = useLocation();
  const { cart, wishlist, settings } = useStore();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 h-16">
      <div className="grid grid-cols-5 h-full">
        {/* Wishlist */}
        <Link to="/wishlist" className="flex flex-col items-center justify-center relative">
          <div className="relative">
            <Heart size={20} className={location.pathname === '/wishlist' ? 'text-emerald-600' : 'text-gray-600'} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold text-gray-700">Wishlist</span>
        </Link>

        {/* Message */}
        <a 
          href={`https://wa.me/88${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center"
        >
          <MessageSquare size={20} className="text-gray-600" />
          <span className="text-[10px] mt-1 font-bold text-gray-700">Message</span>
        </a>

        {/* Home - Floating in Center */}
        <Link to="/" className="flex flex-col items-center justify-center relative">
          <div className="absolute -top-6 bg-black text-white p-3 rounded-full border-4 border-white shadow-lg">
            <Home size={20} />
          </div>
          <span className="text-[10px] mt-6 font-bold text-gray-700">Home</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex flex-col items-center justify-center relative">
          <div className="relative">
            <ShoppingCart size={20} className={location.pathname === '/cart' ? 'text-emerald-600' : 'text-gray-600'} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold text-gray-700">Cart</span>
        </Link>

        {/* Login */}
        <Link to="/profile" className="flex flex-col items-center justify-center">
          <User size={20} className={location.pathname === '/profile' ? 'text-emerald-600' : 'text-gray-600'} />
          <span className="text-[10px] mt-1 font-bold text-gray-700">Login</span>
        </Link>
      </div>
    </div>
  );
}
