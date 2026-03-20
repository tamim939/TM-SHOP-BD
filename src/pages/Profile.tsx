import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, CheckCircle, XCircle, Truck, LogOut, User as UserIcon, LayoutGrid, Download, Camera, Edit2, Save, X } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
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

  const dbUser = allUsers.find(u => u.uid === user.uid);
  const userName = dbUser?.name || user.displayName || 'User';
  const userPhoto = dbUser?.photoURL || user.photoURL;
  const userOrders = orders.filter(order => order.userId === user.uid);
  const totalSpent = userOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const completedOrders = userOrders.filter(o => o.status === 'completed').length;
  const cancelledOrders = userOrders.filter(o => o.status === 'cancelled').length;

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
        alert('প্রোফাইল ফটো আপডেট করতে সমস্যা হয়েছে।');
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
      alert('নাম আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const generateOrderPDF = (order: Order) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(5, 150, 105);
    doc.text('TSB SHOP BD', 105, 20, { align: 'center' });
    
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
      headStyles: { fillColor: [5, 150, 105] }
    });
    
    doc.save(`invoice-${order.id.slice(-8)}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={18} />;
      case 'processing': return <Clock className="text-blue-500" size={18} />;
      case 'shipped': return <Truck className="text-purple-500" size={18} />;
      case 'completed': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'cancelled': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান';
      case 'processing': return 'প্রসেসিং';
      case 'shipped': return 'শিপড';
      case 'completed': return 'সফল';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container max-w-5xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
              
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-5xl font-bold overflow-hidden border-4 border-white shadow-xl mx-auto">
                  {userPhoto ? (
                    <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName[0].toUpperCase()
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2.5 rounded-full shadow-lg hover:bg-emerald-700 transition-all border-2 border-white"
                  title="ছবি পরিবর্তন করুন"
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

              <div className="space-y-2 mb-8">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-center font-bold"
                      placeholder="নতুন নাম"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Save size={20} />
                    </button>
                    <button onClick={() => setIsEditingName(false)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 group">
                    <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
                    <button 
                      onClick={() => { setIsEditingName(true); setNewName(userName); }}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                <div className="bg-emerald-50 p-4 rounded-2xl">
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">সফল অর্ডার</p>
                  <p className="text-2xl font-black text-emerald-700">{completedOrders}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl">
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">বাতিল অর্ডার</p>
                  <p className="text-2xl font-black text-red-700">{cancelledOrders}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">মোট খরচ</p>
                <p className="text-2xl font-black text-gray-900">৳ {totalSpent}</p>
              </div>

              <div className="mt-8 space-y-3">
                {isAdmin && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                    <LayoutGrid size={20} />
                    <span>এডমিন প্যানেল</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 px-6 py-3 rounded-2xl font-bold transition-all"
                >
                  <LogOut size={20} />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Package className="text-emerald-600" size={20} />
                  </div>
                  <span>আমার অর্ডারসমূহ ({userOrders.length})</span>
                </h2>
              </div>

              <div className="divide-y divide-gray-50">
                {userOrders.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="text-gray-300" size={40} />
                    </div>
                    <p className="text-gray-500 font-medium">আপনার কোনো অর্ডার নেই।</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="mt-4 text-emerald-600 font-bold hover:underline"
                    >
                      কেনাকাটা শুরু করুন
                    </button>
                  </div>
                ) : (
                  userOrders.map(order => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={order.id} 
                      className="p-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">অর্ডার আইডি</span>
                            <span className="font-mono font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm self-start">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-bold text-gray-700">{getStatusText(order.status)}</span>
                        </div>
                      </div>

                      <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-4">
                            <div className="relative">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-xl shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500 font-medium">সাইজ: {item.size}</p>
                            </div>
                            <p className="text-sm font-black text-gray-900">৳ {item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button 
                          onClick={() => generateOrderPDF(order)}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-emerald-100"
                        >
                          <Download size={18} />
                          <span>ইনভয়েস ডাউনলোড</span>
                        </button>
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">মোট পরিশোধিত</p>
                          <p className="text-xl font-black text-emerald-600">৳ {order.totalAmount}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

