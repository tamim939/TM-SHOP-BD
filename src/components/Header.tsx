import { ShoppingBag, Heart, User, Search, Menu, X, Phone, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, wishlist, user, isAdmin, categories, allUsers, settings, settingsLoaded, products } = useStore();
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 5);

  const dbUser = allUsers.find(u => u.uid === user?.uid);
  const userPhoto = dbUser?.photoURL || user?.photoURL;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isValidLogo = (logo: string | undefined) => {
    if (!logo) return false;
    // Exclude old hardcoded logo or any logo from that domain
    if (logo.includes('smartpanjabishop.com')) return false;
    return true;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-emerald-600 shadow-md py-3" : "bg-emerald-600 py-3"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button 
            className="text-white p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center h-10 min-w-[120px]">
            {isValidLogo(settings.logo) ? (
              <img 
                src={settings.logo} 
                alt={settings.companyName || "TSB SHOP BD"} 
                className="h-8 lg:h-10 w-auto brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-white font-black text-xl tracking-tighter">
                {settings.companyName || "TSB SHOP BD"}
              </span>
            )}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            className="text-white hover:text-emerald-200 transition-colors p-1.5"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search size={20} />
          </button>
          
          <Link to="/wishlist" className="text-white hover:text-emerald-200 transition-colors p-1.5 relative">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-emerald-600">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="text-white hover:text-emerald-200 transition-colors p-1.5 relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-emerald-600">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/profile" className="text-white hover:text-emerald-200 transition-colors p-1.5">
            {userPhoto ? (
              <img src={userPhoto} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white/20" />
            ) : (
              <User size={20} />
            )}
          </Link>

          {isAdmin && (
            <Link to="/admin" className="text-white hover:text-emerald-200 transition-colors p-1.5" title="Admin Panel">
              <LayoutGrid size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white p-4 shadow-lg"
          >
            <div className="container relative">
              <input 
                type="text" 
                placeholder="Search for products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/shop?q=${searchQuery}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                className="w-full border-2 border-emerald-600 rounded-full py-3 px-6 focus:outline-none text-gray-800"
                autoFocus
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/shop?q=${searchQuery}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-600"
              >
                <Search size={20} />
              </button>

              {/* Search Results Preview */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {filteredProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredProducts.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                        >
                          <img src={product.image} alt="" className="w-12 h-12 object-cover rounded-lg mr-4" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-sm text-gray-900">{product.name}</p>
                            <p className="text-xs text-emerald-600 font-bold">Tk {product.price}</p>
                          </div>
                        </Link>
                      ))}
                      <Link
                        to={`/shop?q=${searchQuery}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="block p-3 text-center text-sm font-bold text-emerald-600 hover:bg-gray-50 transition-colors"
                      >
                        View all results
                      </Link>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No products found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                {isValidLogo(settings.logo) ? (
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="h-10 w-auto"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-emerald-600 font-black text-xl tracking-tighter">
                    {settings.companyName || "TSB SHOP BD"}
                  </span>
                )}
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex flex-col">
                <Link 
                  to="/" 
                  className="px-4 py-4 text-[16px] font-medium text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/shop" 
                  className="px-4 py-4 text-[16px] font-medium text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                
                {/* Categories in Mobile Menu */}
                <div className="px-4 py-4 border-b">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</p>
                  <div className="grid grid-cols-3 gap-4">
                    {categories.slice(0, 6).map(cat => (
                      <Link 
                        key={cat.id} 
                        to={`/category/${cat.slug}`}
                        className="flex flex-col items-center space-y-1"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[10px] text-center font-medium text-gray-600 truncate w-full">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link 
                  to="/wishlist" 
                  className="px-4 py-4 text-[16px] font-medium text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link 
                  to="/cart" 
                  className="px-4 py-4 text-[16px] font-medium text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cart
                </Link>
                <Link 
                  to="/profile" 
                  className="px-4 py-4 text-[16px] font-medium text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
