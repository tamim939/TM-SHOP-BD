import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  List, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ShoppingBag, 
  Users as UsersIcon, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Ban, 
  UserCheck,
  FileText,
  Send,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ADMIN_EMAIL = 'rsjonayed07@gmail.com';

const Admin: React.FC = () => {
  const { 
    products, 
    categories, 
    sliders, 
    settings, 
    orders,
    isAdmin,
    authLoading,
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSlider,
    updateSlider,
    deleteSlider,
    updateSettings,
    updateOrderStatus,
    deleteOrder,
    banUser,
    deleteUser,
    allUsers: users,
    reviews,
    deleteReview,
    addAdminReply
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isEditingCategory, setIsEditingCategory] = useState<any>(null);
  const [isEditingSlider, setIsEditingSlider] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    discount: '',
    category: '',
    image: '',
    description: '',
    stock: 'in-stock',
    isNew: true,
    isHot: false
  });

  const [categoryData, setCategoryData] = useState({
    name: '',
    image: ''
  });

  const [sliderData, setSliderData] = useState({
    image: '',
    mobileImage: '',
    link: ''
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Basic validation
      if (!formData.name || !formData.price) {
        alert("দয়া করে নাম এবং দাম প্রদান করুন।");
        setIsSaving(false);
        return;
      }

      const price = Number(formData.price);
      if (isNaN(price)) {
        alert("দয়া করে সঠিক দাম প্রদান করুন।");
        setIsSaving(false);
        return;
      }

      const productData: any = {
        name: formData.name,
        price: price,
        category: formData.category || '',
        image: formData.image || 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?q=80&w=1000&auto=format&fit=crop',
        description: formData.description || '',
        stock: formData.stock || 'in-stock',
        isNew: formData.isNew,
        isHot: formData.isHot
      };

      if (formData.oldPrice) {
        const oldPrice = Number(formData.oldPrice);
        if (!isNaN(oldPrice)) productData.oldPrice = oldPrice;
      }

      if (formData.discount) {
        const discount = Number(formData.discount);
        if (!isNaN(discount)) productData.discount = discount;
      }

      if (isEditing) {
        await updateProduct({
          ...productData,
          id: isEditing.id,
          slug: isEditing.slug || ''
        });
      } else {
        await addProduct(productData);
      }
      setShowProductForm(false);
      setIsEditing(null);
      setFormData({ 
        name: '', 
        price: '', 
        oldPrice: '', 
        discount: '', 
        category: '', 
        image: '', 
        description: '', 
        stock: 'in-stock',
        isNew: true,
        isHot: false
      });
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(`প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!categoryData.name) {
        alert("দয়া করে ক্যাটাগরির নাম প্রদান করুন।");
        setIsSaving(false);
        return;
      }

      const finalCategoryData = {
        ...categoryData,
        image: categoryData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
      };

      if (isEditingCategory) {
        await updateCategory({ 
          ...finalCategoryData, 
          id: isEditingCategory.id,
          slug: isEditingCategory.slug || ''
        });
      } else {
        await addCategory(finalCategoryData);
      }
      setShowCategoryForm(false);
      setIsEditingCategory(null);
      setCategoryData({ name: '', image: '' });
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(`ক্যাটাগরি সেভ করতে সমস্যা হয়েছে: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditingSlider) {
        await updateSlider({ ...sliderData, id: isEditingSlider.id });
      } else {
        await addSlider(sliderData);
      }
      setShowSliderForm(false);
      setIsEditingSlider(null);
      setSliderData({ image: '', mobileImage: '', link: '' });
    } catch (error) {
      console.error("Error saving slider:", error);
      alert("স্লাইডার সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  };

  const generateOrderPDF = (order: any) => {
    const doc = new jsPDF();
    
    // Add Logo or Header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text(settings.companyName || 'TSB SHOP BD', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Premium Quality Panjabi Collection', 105, 28, { align: 'center' });
    
    doc.setDrawColor(200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('INVOICE', 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Order ID: #${order.id.substring(0, 8)}`, 20, 55);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString('bn-BD')}`, 20, 62);
    
    // Customer Info Box
    doc.setFillColor(249, 250, 251);
    doc.rect(20, 70, 170, 35, 'F');
    doc.setFontSize(11);
    doc.text('BILL TO:', 25, 78);
    doc.setFontSize(10);
    doc.text(`Name: ${order.customerName}`, 25, 85);
    doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 25, 92);
    doc.text(`Address: ${order.customerAddress || 'N/A'}`, 25, 99);

    const tableData = order.items.map((item: any) => [
      item.name,
      item.size || 'N/A',
      item.quantity,
      `Tk ${item.price}`,
      `Tk ${item.price * item.quantity}`
    ]);

    autoTable(doc, {
      startY: 115,
      head: [['Product', 'Size', 'Qty', 'Price', 'Total']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 115;
    
    doc.setFontSize(10);
    const totalAmount = order.totalAmount || order.total || 0;
    const deliveryCharge = order.deliveryCharge || 0;
    const subtotal = totalAmount - deliveryCharge;
    
    doc.text(`Subtotal:`, 140, finalY + 15);
    doc.text(`Tk ${subtotal}`, 175, finalY + 15, { align: 'right' });
    
    doc.text(`Delivery Charge:`, 140, finalY + 22);
    doc.text(`Tk ${deliveryCharge}`, 175, finalY + 22, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total:`, 140, finalY + 32);
    doc.text(`Tk ${totalAmount}`, 175, finalY + 32, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping with us!', 105, finalY + 50, { align: 'center' });

    doc.save(`invoice-${order.id.substring(0, 8)}.pdf`);
  };

  const generateDailyOrdersPDF = () => {
    const today = new Date().toLocaleDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString() === today);

    if (todayOrders.length === 0) {
      alert('আজ কোনো অর্ডার নেই!');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text(`${settings.companyName || 'TSB SHOP BD'} - Daily Orders Report`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${today}`, 105, 28, { align: 'center' });

    const tableData = todayOrders.map(o => [
      o.id.substring(0, 8),
      o.customerName,
      o.customerPhone || 'N/A',
      o.items.length,
      `Tk ${o.totalAmount || 0}`,
      o.status
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Customer', 'Phone', 'Items', 'Total', 'Status']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
    });

    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Orders: ${todayOrders.length}`, 20, finalY + 15);
    doc.text(`Total Revenue: Tk ${totalRevenue}`, 20, finalY + 25);

    doc.save(`daily-report-${today}.pdf`);
  };

  const generateUsersReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text(`${settings.companyName || 'TSB SHOP BD'} - Registered Users Report`, 105, 20, { align: 'center' });

    const tableData = users.map(u => {
      const userOrders = orders.filter(o => o.userId === u.uid);
      const totalSpent = userOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      return [
        u.name || 'Unknown',
        u.email || 'N/A',
        new Date(u.createdAt).toLocaleDateString(),
        userOrders.length,
        `Tk ${totalSpent}`,
        u.isBanned ? 'Banned' : 'Active'
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Email', 'Joined', 'Orders', 'Total Spent', 'Status']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
    });

    (doc as any).lastAutoTable.finalY || 30;
    doc.save('users-report.pdf');
  };

  const generateUserOrdersPDF = (user: any, userOrders: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text(`Order History: ${user.name || 'User'}`, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Email: ${user.email}`, 105, 28, { align: 'center' });

    const tableData = userOrders.map(o => [
      o.id.substring(0, 8),
      new Date(o.createdAt).toLocaleDateString(),
      o.items.length,
      `Tk ${o.totalAmount || 0}`,
      o.status
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Order ID', 'Date', 'Items', 'Total', 'Status']],
      body: tableData,
      headStyles: { fillColor: [5, 150, 105] },
    });

    const totalOrdered = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const confirmedOrders = userOrders.filter(o => o.status !== 'cancelled');
    const totalSpent = confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const cancelledOrders = userOrders.filter(o => o.status === 'cancelled');
    const cancelledAmount = cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

    const finalY = (doc as any).lastAutoTable.finalY || 35;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Orders: ${userOrders.length}`, 20, finalY + 15);
    doc.text(`Total Ordered Amount: Tk ${totalOrdered}`, 20, finalY + 25);
    doc.text(`Total Spent (Confirmed): Tk ${totalSpent}`, 20, finalY + 35);
    doc.text(`Cancelled Amount: Tk ${cancelledAmount}`, 20, finalY + 45);

    doc.save(`user-report-${user.uid.substring(0, 5)}.pdf`);
  };

  const stats = [
    { label: 'মোট অর্ডার', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'মোট প্রোডাক্ট', value: products.length, icon: Package, color: 'bg-emerald-500' },
    { label: 'ক্যাটাগরি', value: categories.length, icon: List, color: 'bg-amber-500' },
    { label: 'মোট আয়', value: `৳${orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0)}`, icon: LayoutDashboard, color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-emerald-600">এডমিন প্যানেল</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <XCircle className="w-6 h-6" /> : <List className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-[70] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 hidden lg:block">
          <h1 className="text-xl font-bold text-emerald-600">এডমিন প্যানেল</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
            { id: 'orders', label: 'অর্ডারসমূহ', icon: ShoppingBag },
            { id: 'products', label: 'প্রোডাক্টস', icon: Package },
            { id: 'categories', label: 'ক্যাটাগরি', icon: List },
            { id: 'sliders', label: 'স্লাইডার', icon: ImageIcon },
            { id: 'users', label: 'ইউজার্স', icon: UsersIcon },
            { id: 'reviews', label: 'রিভিউ', icon: Star },
            { id: 'settings', label: 'সেটিংস', icon: SettingsIcon },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-xl text-white`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">সাম্প্রতিক অর্ডারসমূহ</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-emerald-600 text-sm font-semibold hover:underline"
                >
                  সব দেখুন
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle p-4 lg:p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-100">
                        <th className="pb-4 font-medium">অর্ডার আইডি</th>
                        <th className="pb-4 font-medium hidden sm:table-cell">কাস্টমার</th>
                        <th className="pb-4 font-medium hidden md:table-cell">তারিখ</th>
                        <th className="pb-4 font-medium">টোটাল</th>
                        <th className="pb-4 font-medium">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="text-sm">
                          <td className="py-4 font-medium">#{order.id.substring(0, 8)}</td>
                          <td className="py-4 hidden sm:table-cell">{order.customerName}</td>
                          <td className="py-4 hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 font-bold">৳{order.totalAmount}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                              order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {order.status === 'completed' ? 'সফল' : 
                               order.status === 'pending' ? 'অপেক্ষমান' : 
                               order.status === 'cancelled' ? 'বাতিল' : 
                               order.status === 'processing' ? 'প্রসেসিং' : 'শিপড'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">অর্ডারসমূহ ({orders.length})</h2>
              <button
                onClick={generateDailyOrdersPDF}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>আজকের রিপোর্ট (PDF)</span>
              </button>
            </div>

            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-bold text-lg">#{order.id.substring(0, 8)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {order.status === 'completed' ? 'সফল' : order.status === 'pending' ? 'অপেক্ষমান' : 'বাতিল'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          generateOrderPDF(order);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        title="ইভয়েস ডাউনলোড"
                      >
                        <Download className="w-5 h-5" />
                        <span className="ml-2 sm:hidden font-bold">PDF ডাউনলোড</span>
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="অর্ডার ডিলিট"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="pending">অপেক্ষমান</option>
                        <option value="processing">প্রসেসিং</option>
                        <option value="shipped">শিপড</option>
                        <option value="completed">সফল</option>
                        <option value="cancelled">বাতিল</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">কাস্টমার তথ্য</h4>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                        <p className="font-bold">{order.customerName}</p>
                        <p className="text-gray-600">{order.customerPhone}</p>
                        <p className="text-gray-600 text-sm">{order.customerAddress}</p>
                        {order.note && <p className="text-amber-600 text-sm italic">নোট: {order.note}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">অর্ডার আইটেম</h4>
                      <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.name} {item.size ? `(${item.size})` : ''} x {item.quantity}</span>
                            <span className="font-bold">৳{item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-gray-500">ডেলিভারি চার্জ</span>
                          <span className="font-bold">৳{order.deliveryCharge || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold">মোট</span>
                          <span className="font-bold text-emerald-600">৳{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">প্রোডাক্টস ({products.length})</h2>
              <button
                onClick={() => {
                  setIsEditing(null);
                  setFormData({
                    name: '',
                    price: '',
                    oldPrice: '',
                    discount: '',
                    category: '',
                    image: '',
                    description: '',
                    stock: 'in-stock'
                  });
                  setShowProductForm(true);
                }}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>নতুন প্রোডাক্ট</span>
              </button>
            </div>

            {(showProductForm || isEditing) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditing ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}</h3>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setIsEditing(null); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => {
                          const btn = document.getElementById('product-form-submit-btn');
                          if (btn) btn.click();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold"
                      >
                        {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                      </button>
                    </div>
                  </div>
                  <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">প্রাইস (Tk)</label>
                          <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">পুরাতন প্রাইস</label>
                          <input
                            type="number"
                            value={formData.oldPrice}
                            onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                            placeholder="ঐচ্ছিক"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট (%)</label>
                          <input
                            type="number"
                            value={formData.discount}
                            onChange={e => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="ঐচ্ছিক"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">কোনো ক্যাটাগরি নেই</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">স্টক</label>
                        <select
                          value={formData.stock}
                          onChange={e => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="in-stock">ইন স্টক</option>
                          <option value="out-of-stock">আউট অফ স্টক</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        placeholder="ইমেজ না দিলে ডিফল্ট ইমেজ ব্যবহার হবে"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">বর্ণনা</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNew}
                          onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">নতুন প্রোডাক্ট (New Arrival)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isHot}
                          onChange={e => setFormData({ ...formData, isHot: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">হট প্রোডাক্ট (Hot Product)</span>
                      </label>
                    </div>
                    
                    {/* Hidden submit button to allow triggering from outside */}
                    <button type="submit" id="product-form-submit-btn" className="hidden" />

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setIsEditing(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-bold"
                      >
                        {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-emerald-600 font-bold mb-1">৳{product.price}</p>
                    <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">{product.category}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { 
                          setIsEditing(product); 
                          setFormData({
                            ...product,
                            category: product.category || '',
                            price: product.price.toString(),
                            oldPrice: product.oldPrice?.toString() || '',
                            discount: product.discount?.toString() || ''
                          }); 
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ডিলিট</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'categories' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">ক্যাটাগরি ({categories.length})</h2>
              <button
                onClick={() => {
                  setIsEditingCategory(null);
                  setCategoryData({ name: '', image: '' });
                  setShowCategoryForm(true);
                }}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>নতুন ক্যাটাগরি</span>
              </button>
            </div>

            {(showCategoryForm || isEditingCategory) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}</h3>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => { setShowCategoryForm(false); setIsEditingCategory(null); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={() => {
                          const btn = document.getElementById('category-form-submit-btn');
                          if (btn) btn.click();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-bold"
                      >
                        {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                      </button>
                    </div>
                  </div>
                  <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                      <input
                        type="text"
                        required
                        value={categoryData.name}
                        onChange={e => setCategoryData({ ...categoryData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={categoryData.image}
                        onChange={e => setCategoryData({ ...categoryData, image: e.target.value })}
                        placeholder="ইমেজ না দিলে ডিফল্ট ইমেজ ব্যবহার হবে"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    {/* Hidden submit button to allow triggering from outside */}
                    <button type="submit" id="category-form-submit-btn" className="hidden" />

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { setShowCategoryForm(false); setIsEditingCategory(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-bold"
                      >
                        {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500">স্লাগ: {category.slug}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { setIsEditingCategory(category); setCategoryData(category); }}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'sliders' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">স্লাইডার ({sliders.length})</h2>
              <button
                onClick={() => setShowSliderForm(true)}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>নতুন স্লাইডার</span>
              </button>
            </div>

            {(showSliderForm || isEditingSlider) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">{isEditingSlider ? 'স্লাইডার এডিট করুন' : 'নতুন স্লাইডার যোগ করুন'}</h3>
                  <form onSubmit={handleSaveSlider} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ডেস্কটপ ইমেজ ইউআরএল</label>
                      <input
                        type="text"
                        required
                        value={sliderData.image}
                        onChange={e => setSliderData({ ...sliderData, image: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল ইমেজ ইউআরএল (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={sliderData.mobileImage}
                        onChange={e => setSliderData({ ...sliderData, mobileImage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্ক (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={sliderData.link}
                        onChange={e => setSliderData({ ...sliderData, link: e.target.value })}
                        placeholder="/category/panjabi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowSliderForm(false); setIsEditingSlider(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        বাতিল
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sliders.map(slider => (
                <div key={slider.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={slider.image} alt="Slider" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-4 truncate">লিঙ্ক: {slider.link || 'নেই'}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setIsEditingSlider(slider); setSliderData(slider); }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => deleteSlider(slider.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>ডিলিট</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">ইউজার্স ({users.length})</h2>
              <button
                onClick={generateUsersReportPDF}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>ইউজার রিপোর্ট (PDF)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {users.map(user => {
                const userOrders = orders.filter(o => o.userId === user.uid);
                const totalOrdered = userOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
                const confirmedOrders = userOrders.filter(o => o.status !== 'cancelled');
                const totalSpent = confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
                const cancelledOrders = userOrders.filter(o => o.status === 'cancelled');
                const cancelledAmount = cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
                
                return (
                  <div key={user.uid} className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{user.name || 'Unknown'}</h3>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:flex lg:items-center gap-4 lg:gap-8">
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">অর্ডার</p>
                          <p className="font-bold text-lg">{userOrders.length} টি</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">মোট অর্ডার</p>
                          <p className="font-bold text-lg text-gray-600">Tk {totalOrdered}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">মোট খরচ</p>
                          <p className="font-bold text-lg text-emerald-600">Tk {totalSpent}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">বাতিল ব্যালেন্স</p>
                          <p className="font-bold text-lg text-red-600">Tk {cancelledAmount}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">স্ট্যাটাস</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            user.isBanned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {user.isBanned ? 'ব্যানড' : 'অ্যাক্টিভ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                        <button
                          onClick={() => generateUserOrdersPDF(user, userOrders)}
                          className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="ইউজার রিপোর্ট ডাউনলোড"
                        >
                          <Download className="w-5 h-5" />
                          <span className="lg:hidden">রিপোর্ট</span>
                        </button>
                        <button
                          onClick={() => banUser(user.uid, !user.isBanned)}
                          className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            user.isBanned 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                          title={user.isBanned ? 'আনব্যান করুন' : 'ব্যান করুন'}
                        >
                          {user.isBanned ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                          <span className="lg:hidden">{user.isBanned ? 'আনব্যান' : 'ব্যান'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই ইউজারকে ডিলিট করতে চান?')) {
                              deleteUser(user.uid);
                            }
                          }}
                          className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="ইউজার ডিলিট"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="lg:hidden">ডিলিট</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-800">কাস্টমার রিভিউ ({reviews.length})</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">এখনো কোনো রিভিউ নেই।</p>
                </div>
              ) : (
                reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(review => {
                  const product = products.find(p => p.id === review.productId);
                  return (
                    <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-100 flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold">
                                {review.userPhoto ? (
                                  <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  review.userName[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{review.userName}</p>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                                  <span className="text-xs text-gray-400 ml-2">
                                    {new Date(review.createdAt).toLocaleDateString('bn-BD')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই রিভিউটি ডিলিট করতে চান?')) {
                                  deleteReview(review.productId, review.id);
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-emerald-600 mb-1">প্রোডাক্ট: {product?.name || 'অজানা প্রোডাক্ট'}</p>
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                          </div>

                          {review.adminReply ? (
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-emerald-700">আপনার রিপ্লাই</p>
                                <span className="text-[10px] text-emerald-400">
                                  {review.adminReplyAt && new Date(review.adminReplyAt).toLocaleDateString('bn-BD')}
                                </span>
                              </div>
                              <p className="text-sm text-emerald-800 italic">{review.adminReply}</p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={replyText[review.id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                placeholder="রিপ্লাই লিখুন..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                              />
                              <button
                                onClick={() => {
                                  if (replyText[review.id]?.trim()) {
                                    addAdminReply(review.productId, review.id, replyText[review.id]);
                                    setReplyText({ ...replyText, [review.id]: '' });
                                  }
                                }}
                                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {product && (
                          <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 hidden md:block">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">সেটিংস</h2>
              <button
                onClick={() => {
                  const form = document.getElementById('settings-form') as HTMLFormElement;
                  if (form) form.requestSubmit();
                }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                সেটিংস সেভ করুন
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl shadow-sm">
              <form id="settings-form" onSubmit={(e) => { e.preventDefault(); alert('সেটিংস সেভ হয়েছে!'); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">কোম্পানির নাম</label>
                  <input
                    type="text"
                    value={settings.companyName || ''}
                    onChange={e => updateSettings({ ...settings, companyName: e.target.value })}
                    placeholder="TSB SHOP BD"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ওয়েবসাইট লোগো (লিঙ্ক)</label>
                  <input
                    type="text"
                    value={settings.logo || ''}
                    onChange={e => updateSettings({ ...settings, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">লোগো পরিবর্তনের জন্য একটি সরাসরি ইমেজ লিঙ্ক দিন।</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ডেলিভারি চার্জ (টাকা)</label>
                  <input
                    type="number"
                    value={settings.shippingCharge || 60}
                    onChange={e => updateSettings({ ...settings, shippingCharge: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={e => updateSettings({ ...settings, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">স্লাইডারের নিচের টাইটেল</label>
                  <input
                    type="text"
                    value={settings.sliderTitle || ''}
                    onChange={e => updateSettings({ ...settings, sliderTitle: e.target.value })}
                    placeholder="যেমন: আমাদের নতুন কালেকশন"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
