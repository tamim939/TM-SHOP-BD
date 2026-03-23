import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, CheckCircle, XCircle, Truck, LogOut, User as UserIcon, LayoutGrid, Download, Camera, Edit2, Save, X, ChevronRight } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, orders, authLoading, isAdmin, allUsers, updateUserProfile } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const dbUser = allUsers.find(u => u.uid === user?.uid);
  const userName = dbUser?.name || user?.displayName || 'User';

  useEffect(() => {
    if (userName && !newName) {
      setNewName(userName);
    }
  }, [userName]);

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

  const userPhoto = dbUser?.photoURL || user.photoURL;
  const userOrders = orders.filter(order => order.userId === user.uid);
  const totalSpent = userOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const completedOrders = userOrders.filter(o => o.status === 'completed').length;
  const pendingOrders = userOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const recentOrders = [...userOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        await updateUserProfile({ photoURL: base64String });
      } catch (error) {
        alert('Error updating profile photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await updateUserProfile({ name: newName });
      setIsEditingName(false);
    } catch (error) {
      alert('Error updating name.');
    }
  };

  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38);
    doc.text('TM SHOP BD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Invoice / Order Details', 105, 30, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(`Order ID: #${order.id.toUpperCase()}`, 20, 45);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 52);
    doc.text(`Status: ${order.status}`, 20, 59);
    
    doc.text('Customer Details:', 140, 45);
    doc.text(`Name: ${order.customerName}`, 140, 52);
    doc.text(`Phone: ${order.customerPhone || ''}`, 140, 59);
    doc.text(`Address: ${order.customerAddress || ''}`, 140, 66, { maxWidth: 50 });
    
    autoTable(doc, {
      startY: 80,
      head: [['Product', 'Size', 'Price', 'Qty', 'Total']],
      body: order.items.map(item => [
        item.name,
        item.size,
        `Tk ${item.price}`,
        item.quantity,
        `Tk ${item.price * item.quantity}`
      ]),
      foot: [['', '', '', 'Total Amount', `Tk ${order.totalAmount}`]],
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] }
    });
    
    doc.save(`invoice-${order.id.slice(-8)}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={18} />;
      case 'processing': return <Clock className="text-blue-500" size={18} />;
      case 'shipped': return <Truck className="text-purple-500" size={18} />;
      case 'completed': return <CheckCircle className="text-red-500" size={18} />;
      case 'cancelled': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 lg:pb-12">
      <div className="container max-w-5xl px-4">
        {/* Welcome Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative mb-6 group">
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100">
              <img 
                src={user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                alt={userName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <label className="absolute bottom-1 right-1 p-2.5 bg-red-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition-all active:scale-90">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{userName}</h1>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm">{isAdmin ? 'Administrator' : 'Customer'}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsEditingName(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
            >
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white text-gray-600 border border-gray-200 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/orders')}>
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
              <Package size={24} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-black text-gray-900">{userOrders.length}</p>
            <ChevronRight className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors" size={20} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/orders')}>
            <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
              <Clock size={24} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-black text-gray-900">{pendingOrders}</p>
            <ChevronRight className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors" size={20} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/orders')}>
            <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-red-600">
              <CheckCircle size={24} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-black text-gray-900">{completedOrders}</p>
            <ChevronRight className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400 transition-colors" size={20} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-all">
            <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
              <span className="text-xl font-bold">৳</span>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-3xl font-black text-gray-900">BDT {totalSpent}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center space-x-3">
              <div className="bg-red-50 p-2 rounded-lg">
                <Package className="text-red-600" size={20} />
              </div>
              <span>Recent Orders</span>
            </h2>
            <Link to="/orders" className="text-red-600 font-bold text-sm hover:underline">View All</Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="p-20 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-gray-300" size={40} />
                </div>
                <p className="text-gray-500 font-medium">No orders yet.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 text-red-600 font-bold hover:underline"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">BDT {order.totalAmount}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'text-red-600' : 
                          order.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <button 
                        onClick={() => generateOrderPDF(order)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-6 py-4 rounded-3xl font-bold hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <LayoutGrid size={20} />
            <span>Go to Admin Panel</span>
          </button>
        )}

        {/* Edit Name Modal */}
        <AnimatePresence>
          {isEditingName && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                <div className="space-y-6">
                  <div className="relative inline-block mb-6 mx-auto w-full text-center">
                    <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center text-red-600 text-5xl font-bold overflow-hidden border-4 border-white shadow-xl mx-auto">
                      {userPhoto ? (
                        <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        userName[0].toUpperCase()
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1/2 translate-x-16 bg-red-600 text-white p-2.5 rounded-full shadow-lg hover:bg-red-700 transition-all border-2 border-white"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-bold"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateName}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

