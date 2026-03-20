import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import ChatWidget from './components/ChatWidget';
import LoadingScreen from './components/LoadingScreen';
import { StoreProvider, useStore } from './context/StoreContext';

function Layout() {
  const isAppReady = useStore().isAppReady;
  const location = window.location.pathname;
  const isAdminPage = location === '/admin';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className={`flex-grow relative min-h-[400px] ${!isAdminPage ? 'pt-16 lg:pt-20' : ''}`}>
        {!isAppReady ? (
          <LoadingScreen />
        ) : (
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
          </Routes>
        )}
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <BottomNav />}
      {!isAdminPage && <ChatWidget />}
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
