import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Support from './pages/Support';
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import { StoreProvider, useStore } from './context/StoreContext';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

function Layout() {
  const { settings } = useStore();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const hasNotice = settings.showNotice && settings.noticeText && settings.noticeText.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className={`flex-grow relative min-h-[80vh] ${!isAdminPage ? (hasNotice ? 'pt-28 lg:pt-32' : 'pt-16 lg:pt-20') : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <BottomNav />}
      
      {/* Floating Support Button */}
      {!isAdminPage && (
        <Link 
          to="/support"
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-all active:scale-95 group"
        >
          <div className="absolute -top-10 right-0 bg-white text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
            Need Help?
          </div>
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white animate-pulse" />
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <ScrollToTop />
        <Layout />
      </Router>
    </StoreProvider>
  );
}
