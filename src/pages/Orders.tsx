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

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <AuthModal />
      </div>
    );
  }

  const userOrders = orders.filter(order => order.userId === user.uid);
  
  const filters = [
    'All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  ];

  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeFilter === 'All Orders') return matchesSearch;
    if (activeFilter === 'Pending') return matchesSearch && order.status === 'pending';
    if (activeFilter === 'Processing') return matchesSearch && order.status === 'processing';
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
      case 'processing': return 'Processing';
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
                          <Link 
                            to={`/order/${order.id}`}
                            className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

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
