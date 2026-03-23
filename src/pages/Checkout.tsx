import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, CreditCard, Truck, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendTelegramNotification } from '../utils/telegram';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder, settings, user, categories } = useStore();
  const { product, selectedSize, quantity } = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate('/profile', { state: { from: location.pathname, checkoutData: location.state } });
    }
  }, [user, navigate, location]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod' as 'cod' | 'bkash' | 'nagad' | 'rocket',
    shippingLocation: 'inside' as 'inside' | 'outside',
    paymentPhone: '',
    transactionId: '',
    note: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">No items in checkout</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-red-600 font-bold">Go Shopping</button>
      </div>
    );
  }

  const shippingCharge = formData.shippingLocation === 'inside' 
    ? (settings.shippingCharge || 0) 
    : (settings.shippingChargeOutside || 0);

  const subtotal = product.price * quantity;
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (product.productCouponCode && appliedCoupon.code.toUpperCase() === product.productCouponCode.toUpperCase()) {
      const discountPercent = product.productCouponDiscount || 0;
      return Math.round((subtotal * discountPercent) / 100);
    }

    const productCategory = categories.find(c => c.slug === product.category);
    if (productCategory?.categoryCouponCode && appliedCoupon.code.toUpperCase() === productCategory.categoryCouponCode.toUpperCase()) {
      const discountPercent = productCategory.categoryCouponDiscount || 0;
      return Math.round((subtotal * discountPercent) / 100);
    }

    if (appliedCoupon.code.toUpperCase() === 'PROTHOM' && product.couponDiscount) {
      return product.couponDiscount * quantity;
    }

    if (appliedCoupon.type === 'percentage') {
      return Math.round((subtotal * appliedCoupon.discount) / 100);
    }
    return appliedCoupon.discount;
  };

  const discountAmount = calculateDiscount();
  const totalAmount = subtotal + shippingCharge - discountAmount;

  const advancePercentage = settings.advancePaymentPercentage || 0;
  const advanceAmount = formData.paymentMethod === 'cod' ? 0 : Math.round((totalAmount * advancePercentage) / 100);
  const dueAmount = totalAmount - advanceAmount;

  const handleApplyCoupon = () => {
    setCouponError('');
    const upperCode = couponCode.toUpperCase();
    
    if (product.productCouponCode && upperCode === product.productCouponCode.toUpperCase()) {
      setAppliedCoupon({
        id: 'product-specific',
        code: product.productCouponCode,
        discount: product.productCouponDiscount || 0,
        type: 'percentage'
      });
      setCouponCode('');
      return;
    }

    const productCategory = categories.find(c => c.slug === product.category);
    if (productCategory?.categoryCouponCode && upperCode === productCategory.categoryCouponCode.toUpperCase()) {
      setAppliedCoupon({
        id: 'category-specific',
        code: productCategory.categoryCouponCode,
        discount: productCategory.categoryCouponDiscount || 0,
        type: 'percentage'
      });
      setCouponCode('');
      return;
    }

    setCouponError('Invalid coupon code! Try again.');
  };

  const handleSubmit = async () => {
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
        image: product.image,
        slug: product.slug
      }],
      totalAmount: totalAmount,
      deliveryCharge: shippingCharge,
      discountAmount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      paymentMethod: formData.paymentMethod,
      paymentPhone: formData.paymentPhone,
      transactionId: formData.transactionId,
      advanceAmount: advanceAmount,
      dueAmount: dueAmount,
      paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'awaiting-verification',
      status: 'pending' as const,
      note: formData.note,
      createdAt: new Date().toISOString()
    };

    await addOrder(newOrder);
    await sendTelegramNotification(newOrder);

    navigate('/order-success', { 
      state: { 
        order: newOrder
      } 
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.address) {
        alert('Please fill in all shipping information');
        return;
      }
    }
    if (step === 3) {
      if (formData.paymentMethod !== 'cod') {
        if (!formData.paymentPhone || !formData.transactionId) {
          alert('Please fill in payment details');
          return;
        }
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const steps = [
    { id: 1, name: 'Shipping' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Details' },
    { id: 4, name: 'Review' }
  ];

  return (
    <div className="pt-8 pb-12 bg-gray-50 min-h-screen">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative max-w-md mx-auto">
              {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= s.id ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-400 border-2'
                    }`}>
                      {s.id}
                    </div>
                    <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${
                      step >= s.id ? 'text-red-600' : 'text-gray-400'
                    }`}>{s.name}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-grow h-[2px] bg-gray-200 mx-2 -mt-6">
                      <div className={`h-full bg-red-600 transition-all duration-300`} style={{ width: step > s.id ? '100%' : '0%' }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-8">Shipping Address</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        placeholder="Enter your name"
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="tel" 
                        placeholder="01XXXXXXXXX"
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Shipping Location <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setFormData({...formData, shippingLocation: 'inside'})}
                          className={`py-4 px-6 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-between ${
                            formData.shippingLocation === 'inside'
                              ? 'border-red-600 bg-red-50 text-red-600'
                              : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50/50'
                          }`}
                        >
                          <span>Inside Dhaka</span>
                          <span>Tk {settings.shippingCharge}</span>
                        </button>
                        <button
                          onClick={() => setFormData({...formData, shippingLocation: 'outside'})}
                          className={`py-4 px-6 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-between ${
                            formData.shippingLocation === 'outside'
                              ? 'border-red-600 bg-red-50 text-red-600'
                              : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50/50'
                          }`}
                        >
                          <span>Outside Dhaka</span>
                          <span>Tk {settings.shippingChargeOutside}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Full Address <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="House no, Road no, Area, City"
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button onClick={nextStep} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                        Next
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-8">Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'cod', name: 'Cash on Delivery', icon: <Truck className="w-6 h-6" />, desc: 'Pay when you receive' },
                      { id: 'bkash', name: 'bKash', icon: <img src="https://i.ibb.co.com/v6m80Yd/bkash.png" className="w-8 h-8 object-contain" />, desc: 'Pay via bKash' },
                      { id: 'nagad', name: 'Nagad', icon: <img src="https://i.ibb.co.com/2YyVv6X/nagad.png" className="w-8 h-8 object-contain" />, desc: 'Pay via Nagad' },
                      { id: 'rocket', name: 'Rocket', icon: <img src="https://i.ibb.co.com/v6m80Yd/bkash.png" className="w-8 h-8 object-contain" />, desc: 'Pay via Rocket' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setFormData({...formData, paymentMethod: method.id as any})}
                        className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start space-x-4 ${
                          formData.paymentMethod === method.id
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${formData.paymentMethod === method.id ? 'bg-red-600 text-white' : 'bg-white text-gray-400'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{method.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{method.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between pt-8">
                    <button onClick={prevStep} className="px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Back</button>
                    <button onClick={nextStep} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                      {formData.paymentMethod === 'cod' ? 'Review Order' : 'Next'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  {formData.paymentMethod === 'cod' ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Truck className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Cash on Delivery</h3>
                      <p className="text-gray-500">You will pay the full amount when you receive the product.</p>
                      <div className="flex justify-between pt-12">
                        <button onClick={prevStep} className="px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Back</button>
                        <button onClick={nextStep} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Review Order</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <img 
                            src={formData.paymentMethod === 'bkash' ? "https://i.ibb.co.com/v6m80Yd/bkash.png" : "https://i.ibb.co.com/2YyVv6X/nagad.png"} 
                            className="w-10 h-10 object-contain" 
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-600 capitalize">Pay with {formData.paymentMethod}</h3>
                          <p className="text-xs text-red-400">Please complete the advance payment to proceed.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Advance Payment ({advancePercentage}%)</p>
                          <p className="text-3xl font-bold text-red-600">Tk {advanceAmount}</p>
                          <p className="text-xs text-gray-400 mt-2">Remaining Tk {dueAmount} to be paid on delivery</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Send Money to this Number</p>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-gray-800">
                              {formData.paymentMethod === 'bkash' ? settings.bkashNumber : 
                               formData.paymentMethod === 'nagad' ? settings.nagadNumber : settings.rocketNumber}
                            </p>
                            <button 
                              onClick={() => {
                                const num = formData.paymentMethod === 'bkash' ? settings.bkashNumber : 
                                            formData.paymentMethod === 'nagad' ? settings.nagadNumber : settings.rocketNumber;
                                navigator.clipboard.writeText(num || '');
                                alert('Number copied!');
                              }}
                              className="p-2 bg-white text-gray-500 rounded-lg hover:text-red-600 transition-colors shadow-sm"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start space-x-3">
                        <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 text-xs font-bold mt-0.5">!</div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Go to your {formData.paymentMethod} App → Send Money → Enter the number above → Enter amount → Confirm. After sending, provide your number and Transaction ID below.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Your Payment Phone Number <span className="text-red-500">*</span></label>
                          <input 
                            type="tel" 
                            placeholder="01XXXXXXXXX"
                            className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                            value={formData.paymentPhone}
                            onChange={e => setFormData({...formData, paymentPhone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Transaction ID <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            placeholder="e.g. TRX123456789"
                            className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                            value={formData.transactionId}
                            onChange={e => setFormData({...formData, transactionId: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-8">
                        <button onClick={prevStep} className="px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Back</button>
                        <button onClick={nextStep} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Review Order</button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-8">Review & Place Order</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shipping To</h3>
                      <p className="font-bold text-lg">{formData.name}</p>
                      <p className="text-gray-600">{formData.phone}</p>
                      <p className="text-gray-600 mt-1">{formData.address}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Method</h3>
                      <div className="flex items-center space-x-3">
                        <p className="font-bold text-lg capitalize">{formData.paymentMethod}</p>
                        {formData.paymentMethod !== 'cod' && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Awaiting Verification</span>
                        )}
                      </div>
                      {formData.paymentMethod !== 'cod' && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Sender: {formData.paymentPhone}</p>
                          <p>TxID: {formData.transactionId}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Order Items</h3>
                      <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100">
                        <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                          <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-800">{product.name}</h4>
                          <p className="text-xs text-gray-400">Size: {selectedSize} | Qty: {quantity}</p>
                          <p className="text-sm font-bold text-red-600 mt-1">Tk {product.price * quantity}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Order Note (Optional)</label>
                      <textarea 
                        rows={2}
                        placeholder="Any instruction for the seller..."
                        className="w-full border-2 border-gray-100 rounded-2xl py-4 px-6 focus:border-red-600 outline-none transition-all bg-gray-50/50"
                        value={formData.note}
                        onChange={e => setFormData({...formData, note: e.target.value})}
                      />
                    </div>

                    <div className="flex justify-between pt-8">
                      <button onClick={prevStep} className="px-10 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Back</button>
                      <button onClick={handleSubmit} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Place Order</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24"
              >
                <h2 className="text-xl font-bold mb-8">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">Tk {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">Tk {shippingCharge}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span className="flex items-center">
                        Coupon Discount ({appliedCoupon.code})
                        <button onClick={() => setAppliedCoupon(null)} className="ml-1 text-red-500 hover:text-red-700">
                          <CheckCircle2 size={12} />
                        </button>
                      </span>
                      <span className="font-bold">- Tk {discountAmount}</span>
                    </div>
                  )}

                  {formData.paymentMethod !== 'cod' && (
                    <>
                      <div className="flex justify-between text-sm text-red-600 pt-4 border-t border-dashed">
                        <span className="font-medium">Advance Payment ({advancePercentage}%)</span>
                        <span className="font-bold">Tk {advanceAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span className="font-medium">Due Payment</span>
                        <span className="font-bold">Tk {dueAmount}</span>
                      </div>
                    </>
                  )}

                  <div className="bg-red-50 p-6 rounded-3xl mt-8 flex justify-between items-center">
                    <span className="text-lg font-bold text-red-900">Total</span>
                    <span className="text-3xl font-black text-red-600">Tk {totalAmount}</span>
                  </div>
                </div>

                {step === 1 && (
                  <div className="pt-4 mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3">Use coupon code below:</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-grow border-2 border-gray-100 rounded-2xl py-3 px-4 focus:border-red-600 outline-none text-sm bg-gray-50/50"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-md shadow-red-100"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-[10px] mt-2 ml-1 font-medium">{couponError}</p>}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-[10px] text-gray-400 justify-center">
                    <Truck size={14} />
                    <span>Fast Delivery Guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-gray-400 justify-center">
                    <CheckCircle2 size={14} />
                    <span>Secure Payment Process</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
