import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ShoppingBag, Package, CheckCircle, Clock, Truck, XCircle, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, authLoading, user, isAdmin, products } = useStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const order = orders.find(o => o.id === id);

  const getProductSlug = (item: any) => {
    if (item.slug) return item.slug;
    const product = products.find(p => p.id === item.productId);
    return product?.slug || '';
  };

  if (!order || (user && order.userId !== user.uid && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-red-600" size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-8">We couldn't find the order you're looking for or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'completed': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { key: 'processing', label: 'Order Confirmed', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { key: 'shipped', label: 'Order Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50' },
    { key: 'completed', label: 'Order Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container max-w-4xl px-4">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/orders')}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 font-bold mb-2 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to Orders</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Order #{order.id.toUpperCase()}</h1>
            <p className="text-gray-500 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button 
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center space-x-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <ShoppingBag size={20} />
            <span>Continue Shopping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Order Status Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-900">Order Status</h2>
              {isCancelled && (
                <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider">
                  Cancelled
                </span>
              )}
            </div>

            {!isCancelled ? (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>
                <div className="space-y-8">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex items-start space-x-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isCompleted ? step.bg : 'bg-gray-50'}`}>
                          <step.icon className={isCompleted ? step.color : 'text-gray-300'} size={24} />
                        </div>
                        <div className="pt-1">
                          <p className={`font-black text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                          {isCompleted && (
                            <p className="text-xs text-gray-400 font-bold mt-0.5">
                              {idx === 0 ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Updated recently'}
                            </p>
                          )}
                        </div>
                        {isCompleted && (
                          <div className="ml-auto">
                            <CheckCircle className="text-green-500" size={20} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 bg-red-50 p-6 rounded-2xl border border-red-100">
                <div className="bg-red-100 p-3 rounded-xl">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="font-black text-red-700">Order Cancelled</p>
                  <p className="text-sm text-red-600/70 font-medium">This order has been cancelled and will not be processed.</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-black text-gray-900">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-gray-900 leading-tight mb-1">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.size && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              Color: {item.color}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-bold">Qty: {item.quantity} × BDT {item.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-gray-900">BDT {item.price * item.quantity}</p>
                        <Link 
                          to={`/product/${getProductSlug(item)}`}
                          className="text-red-600 text-xs font-black flex items-center justify-end space-x-1 hover:underline mt-1"
                        >
                          <Eye size={14} />
                          <span>View Product</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-black text-gray-900">BDT {order.totalAmount - (order.deliveryCharge || 0) + (order.discountAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Shipping Charge</span>
                  <span className="font-black text-gray-900">BDT {order.deliveryCharge || 0}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">Discount</span>
                    <span className="font-black text-red-600">- BDT {order.discountAmount}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-2xl font-black text-red-600">BDT {order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-black text-gray-900 mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    order.paymentStatus === 'awaiting-verification' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.paymentStatus?.replace('-', ' ') || 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Advance Paid</p>
                    <p className="font-black text-gray-900">BDT {order.advanceAmount || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Due Payment</p>
                    <p className="font-black text-red-600">BDT {order.dueAmount || order.totalAmount}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="font-black text-gray-900 uppercase">{order.paymentMethod || 'Cash on Delivery'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6">Shipping Address</h2>
            <div className="flex items-start space-x-4">
              <div className="bg-gray-50 p-3 rounded-xl text-gray-400">
                <Truck size={24} />
              </div>
              <div>
                <p className="font-black text-gray-900 mb-1">{order.customerName}</p>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{order.customerAddress}</p>
                <p className="text-sm text-gray-900 font-black mt-2">Phone: {order.customerPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
