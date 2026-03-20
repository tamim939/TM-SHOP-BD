import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendTelegramNotification } from '../utils/telegram';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder, settings, user } = useStore();
  const { product, selectedSize, quantity } = location.state || {};

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">No items in checkout</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 font-bold">Go Shopping</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder = {
      userId: user?.uid || null,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      items: [{
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize,
        image: product.image
      }],
      totalAmount: product.price * quantity + (settings.shippingCharge || 0),
      deliveryCharge: settings.shippingCharge || 0,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    await addOrder(newOrder);
    
    // Send Telegram Notification
    await sendTelegramNotification(newOrder);

    // Navigate to success page with data
    navigate('/order-success', { 
      state: { 
        product, 
        selectedSize, 
        quantity, 
        formData 
      } 
    });
  };

  return (
    <div className="pt-8 pb-12 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black-custom">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-sm border"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  <span>Shipping Information</span>
                </h2>
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Enter your name"
                        className="w-full border-2 border-gray-100 rounded-xl py-3 px-4 focus:border-emerald-600 outline-none transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        placeholder="01XXXXXXXXX"
                        className="w-full border-2 border-gray-100 rounded-xl py-3 px-4 focus:border-emerald-600 outline-none transition-colors"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600">Full Address</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="House no, Road no, Area, City"
                      className="w-full border-2 border-gray-100 rounded-xl py-3 px-4 focus:border-emerald-600 outline-none transition-colors"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </form>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  <span>Payment Method</span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div 
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-emerald-600 bg-emerald-600/5 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <Truck className="text-emerald-600" />
                      <div className="text-left">
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay when you receive</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border sticky top-24"
              >
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-400">Size: {selectedSize} | Qty: {quantity}</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">Tk {product.price * quantity}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">Tk {product.price * quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">Tk {settings.shippingCharge}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">Tk {product.price * quantity + settings.shippingCharge}</span>
                  </div>
                </div>

                <button 
                  form="checkout-form"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  <CreditCard size={20} />
                  <span>Confirm Order</span>
                </button>
                
                <p className="text-[10px] text-center text-gray-400 mt-4">
                  By confirming, you agree to our Terms & Conditions
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
