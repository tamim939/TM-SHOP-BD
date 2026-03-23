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
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import LoadingScreen from './components/LoadingScreen';
import { StoreProvider, useStore } from './context/StoreContext';

function Layout() {
  const { settings } = useStore();
  const location = window.location.pathname;
  const isAdminPage = location === '/admin';
  const hasNotice = settings.showNotice && settings.noticeText && settings.noticeText.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className={`flex-grow relative min-h-[400px] ${!isAdminPage ? (hasNotice ? 'pt-28 lg:pt-32' : 'pt-16 lg:pt-20') : ''}`}>
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
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <BottomNav />}
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
