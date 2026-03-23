import { ShoppingBag, Heart, User, Search, Menu, X, Phone, LayoutGrid, Camera } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, user, allUsers, settings, products } = useStore();
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
    if (logo.includes('smartpanjabishop.com')) return false;
    return true;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white",
        isScrolled ? "shadow-md" : "border-b"
      )}
    >
      {/* Notice Bar */}
      {settings.showNotice && settings.noticeText && settings.noticeText.trim() !== '' && (
        <div className="bg-red-600 text-white py-1.5 px-4 relative overflow-hidden">
          <div className="container mx-auto flex items-center justify-center space-x-3">
            <Phone size={12} className="shrink-0" />
            <div className="overflow-hidden whitespace-nowrap">
              <motion.p
                initial={{ x: '100%' }}
                animate={{ x: '-100%' }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="text-[11px] font-bold inline-block uppercase tracking-wider"
              >
                {settings.noticeText}
              </motion.p>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-red-600 to-transparent z-10" />
          <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-red-600 to-transparent z-10" />
        </div>
      )}

      <div className="container flex items-center justify-between gap-4 py-2">
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Toggle */}
          <button 
            className="text-gray-600 p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center group">
            {isValidLogo(settings.logo) ? (
              <img 
                src={settings.logo} 
                alt={settings.companyName || "TM SHOP BD"} 
                className="h-8 md:h-10 lg:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-red-600 font-black text-xl md:text-2xl tracking-tighter group-hover:text-red-700 transition-colors">
                {settings.companyName || "TM SHOP BD"}
              </span>
            )}
          </Link>
        </div>

        {/* Search Bar - Integrated */}
        <div className="hidden md:flex flex-1 justify-center relative mx-4">
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/shop?q=${searchQuery}`);
                  setSearchQuery('');
                }
              }}
              className="w-full bg-gray-100 rounded-full py-2.5 px-6 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm border border-gray-200"
            />
            <button 
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/shop?q=${searchQuery}`);
                  setSearchQuery('');
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden flex-1 flex flex-col items-center px-2 space-y-2">
          <div className="relative w-full max-w-[280px]">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/shop?q=${searchQuery}`);
                  setSearchQuery('');
                }
              }}
              className="w-full bg-gray-100 rounded-full py-2 px-4 focus:outline-none text-xs border border-gray-200"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/shop?q=${searchQuery}`);
                  setSearchQuery('');
                }
              }}
              className="bg-red-600 text-white px-6 py-1.5 rounded-full text-[10px] font-bold shadow-sm"
            >
              Search
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button className="text-gray-400 p-2 hidden sm:block">
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Search Results Preview */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 overflow-hidden z-50"
          >
            <div className="container max-w-xl py-2">
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={() => setSearchQuery('')}
                      className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                    >
                      <img src={product.image} alt="" className="w-12 h-12 object-cover rounded-lg mr-4" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-red-600 font-bold">Tk {product.price}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    to={`/shop?q=${searchQuery}`}
                    onClick={() => setSearchQuery('')}
                    className="block p-3 text-center text-sm font-bold text-red-600 hover:bg-gray-50 transition-colors"
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
                  <span className="text-red-600 font-black text-xl tracking-tighter">
                    {settings.companyName || "TM SHOP BD"}
                  </span>
                )}
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                  <Link 
                    to="/" 
                    className="px-4 py-4 text-[16px] font-bold text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/shop" 
                    className="px-4 py-4 text-[16px] font-bold text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  
                  {/* Categories in Menu */}
                  <div className="bg-gray-50/50 py-2 border-b">
                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</p>
                    {useStore().categories.map(category => (
                      <Link
                        key={category.id}
                        to={`/category/${category.slug}`}
                        className="px-6 py-3 text-[14px] font-bold text-gray-700 block hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <Link 
                    to="/orders" 
                    className="px-4 py-4 text-[16px] font-bold text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    to="/profile" 
                    className="px-4 py-4 text-[16px] font-bold text-gray-800 border-b hover:bg-gray-50 transition-colors" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
