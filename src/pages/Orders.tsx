import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Search, ChevronRight, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import AuthModal from '../components/AuthModal';

export default function Orders() {
  const { user, orders, authLoading } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center px-4">
        <AuthModal />
      </div>
    );
  }

  const userOrders = orders.filter(order => order.userId === user.uid);
  
  const filters = [
    'All Orders', 'Pending', 'Confirmed', 'Order placed', 
    'Shipped', 'Received', 'Shipped to Customer', 'Delivered', 'Cancelled'
  ];

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'All Orders') return matchesSearch;
    if (activeFilter === 'Pending') return matchesSearch && order.status === 'pending';
    if (activeFilter === 'Confirmed') return matchesSearch && order.status === 'processing';
    if (activeFilter === 'Shipped') return matchesSearch && order.status === 'shipped';
    if (activeFilter === 'Delivered') return matchesSearch && order.status === 'completed';
    if (activeFilter === 'Cancelled') return matchesSearch && order.status === 'cancelled';
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Confirmed';
      case 'shipped': return 'Shipped';
      case 'completed': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-12">
      <div className="bg-white border-b px-4 py-6">
        <div className="container max-w-5xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <Package className="text-red-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>
          <p className="text-gray-500 text-sm mb-4">Track and manage your orders</p>
          <button 
            onClick={() => navigate('/shop')}
            className="flex items-center space-x-2 text-gray-600 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>

      <div className="container max-w-5xl px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter 
                      ? 'bg-red-600 text-white shadow-md shadow-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b">
                    <th className="pb-4 font-medium">ORDER</th>
                    <th className="pb-4 font-medium">STATUS</th>
                    <th className="pb-4 font-medium">ITEMS</th>
                    <th className="pb-4 font-medium">TOTAL</th>
                    <th className="pb-4 font-medium text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="text-gray-300" size={40} />
                        </div>
                        <p className="text-gray-500 font-medium">No orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-4">
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{order.items.length} items</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-medium text-gray-700">{order.items.length}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-bold text-gray-900">BDT {order.totalAmount}</p>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                  <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                    <h2 className="text-xl font-black">Order Details</h2>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <XCircle size={24} className="text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                        <p className="font-black text-lg">#{selectedOrder.id.toUpperCase()}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-bold text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                        <p className="font-bold text-sm uppercase">{selectedOrder.paymentMethod || 'COD'}</p>
                      </div>
                    </div>

                    {selectedOrder.paymentMethod !== 'cod' && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Payment Status</p>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            selectedOrder.paymentStatus === 'awaiting-verification' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {selectedOrder.paymentStatus?.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-red-100">
                          <div>
                            <p className="text-[10px] font-bold text-red-400 uppercase">Advance Paid</p>
                            <p className="font-black text-red-600">Tk {selectedOrder.advanceAmount}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-red-400 uppercase">Due Amount</p>
                            <p className="font-black text-red-600">Tk {selectedOrder.dueAmount}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-red-100">
                          <p className="text-[10px] font-bold text-red-400 uppercase">Transaction Info</p>
                          <p className="text-xs font-bold text-red-700">Phone: {selectedOrder.paymentPhone}</p>
                          <p className="text-xs font-bold text-red-700">TxID: {selectedOrder.transactionId}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Address</p>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.customerAddress}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items</p>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-2xl">
                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                              <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                              <p className="text-xs text-gray-400">Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</p>
                              <p className="font-black text-red-600 text-sm">Tk {item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-bold">Subtotal</span>
                        <span className="font-black">Tk {selectedOrder.totalAmount - (selectedOrder.deliveryCharge || 0) + (selectedOrder.discountAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-bold">Shipping</span>
                        <span className="font-black">Tk {selectedOrder.deliveryCharge || 0}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span className="font-bold">Discount</span>
                          <span className="font-black">- Tk {selectedOrder.discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg pt-2 border-t">
                        <span className="font-black">Total Amount</span>
                        <span className="font-black text-red-600">Tk {selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-b-3xl">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-center space-x-4 pt-6 border-t">
                <button className="text-gray-400 text-sm font-medium hover:text-gray-600">« Previous</button>
                <div className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">1</div>
                <button className="text-gray-400 text-sm font-medium hover:text-gray-600">Next »</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
