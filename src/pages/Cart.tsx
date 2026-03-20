import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { sendTelegramNotification } from '../utils/telegram';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, addToCart, clearCart, addOrder, user, settings, coupons, products } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address: ''
  });

  React.useEffect(() => {
    if (user?.displayName && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.displayName || '' }));
    }
  }, [user]);

  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharge = settings.shippingCharge || 60;
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    // Special case for "PROTHOM" or similar if the user wants product-specific discount
    if (appliedCoupon.code.toUpperCase() === 'PROTHOM') {
      return cart.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        return acc + ((product?.couponDiscount || 0) * item.quantity);
      }, 0);
    }

    if (appliedCoupon.type === 'percentage') {
      return Math.round((subtotal * appliedCoupon.discount) / 100);
    }
    return appliedCoupon.discount;
  };

  const discountAmount = calculateDiscount();
  const total = subtotal + deliveryCharge - discountAmount;

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponCode('');
    } else {
      setCouponError('ভুল কুপন কোড! আবার চেষ্টা করুন।');
    }
  };

  const handleUpdateQuantity = (productId: string, size: string, delta: number) => {
    const item = cart.find(i => i.productId === productId && i.size === size);
    if (item) {
      if (item.quantity + delta <= 0) {
        removeFromCart(productId, size);
      } else {
        addToCart({ ...item, quantity: delta });
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      userId: user?.uid || null,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      items: cart,
      totalAmount: total,
      deliveryCharge: deliveryCharge,
      discountAmount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    await addOrder(order);

    // Send Telegram Notification
    await sendTelegramNotification(order);

    setOrderSuccess(true);
    clearCart();
    setTimeout(() => {
      navigate('/profile');
    }, 3000);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Successful!</h1>
          <p className="text-gray-600 mb-6">Your order has been successfully received. Our representative will contact you soon.</p>
          <div className="animate-pulse text-emerald-600 font-medium">
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-tight flex items-center space-x-3">
              <ShoppingBag className="text-emerald-600" />
              <span>Shopping Cart</span>
            </h1>
            <div className="w-12 h-1 bg-emerald-600 mt-2"></div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to your cart now.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <span>Start Shopping</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.productId}-${item.size}`} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-24 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Size: {item.size}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.size, -1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.size, 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">Tk {item.price * item.quantity}</p>
                    <p className="text-xs text-gray-400">Tk {item.price} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary / Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                {!isCheckingOut ? (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>Tk {subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping Charge</span>
                        <span>Tk {deliveryCharge}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600">
                          <span className="flex items-center">
                            কুপন ডিসকাউন্ট ({appliedCoupon.code})
                            <button onClick={() => setAppliedCoupon(null)} className="ml-1 text-red-500">
                              <Trash2 size={12} />
                            </button>
                          </span>
                          <span>- Tk {discountAmount}</span>
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="কুপন কোড লিখুন"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-[10px] mt-1">{couponError}</p>}
                      </div>

                      <div className="border-t pt-4 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-emerald-600">Tk {total}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!user) {
                          alert('অর্ডার করতে হলে আপনাকে লগইন করতে হবে।');
                          navigate('/profile', { state: { from: '/cart' } });
                          return;
                        }
                        setIsCheckingOut(true);
                      }}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>Checkout</span>
                      <ArrowRight size={20} />
                    </button>
                  </>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Enter Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <textarea 
                        required
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                        placeholder="Enter detailed address"
                      ></textarea>
                    </div>
                    <div className="border-t pt-4 mb-4">
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600 text-sm mb-2">
                          <span>কুপন ডিসকাউন্ট ({appliedCoupon.code})</span>
                          <span>- Tk {discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg mb-4">
                        <span>Total Payable</span>
                        <span className="text-emerald-600">Tk {total}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                      >
                        Confirm Order
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
