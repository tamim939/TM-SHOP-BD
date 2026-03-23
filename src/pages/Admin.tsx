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
  Star,
  Ticket,
  Home,
  Camera
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
    verifyPayment,
    deleteOrder,
    banUser,
    deleteUser,
    allUsers: users,
    reviews,
    deleteReview,
    addAdminReply,
    user,
    updateUserProfile
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isEditingCategory, setIsEditingCategory] = useState<any>(null);
  const [isEditingSlider, setIsEditingSlider] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    images: [] as string[],
    maxImages: '5',
    description: '',
    stock: 'in-stock',
    couponDiscount: '',
    productCouponCode: '',
    productCouponDiscount: '',
    isNew: true,
    isHot: false,
    sizes: [] as string[]
  });

  const [categoryData, setCategoryData] = useState({
    name: '',
    image: '',
    categoryCouponCode: '',
    categoryCouponDiscount: ''
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
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress to 70% quality
        callback(dataUrl);
        setIsUploading(false);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert("Error loading image.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Basic validation
      if (!formData.name || !formData.price) {
        alert("Please provide name and price.");
        setIsSaving(false);
        return;
      }

      const price = Number(formData.price);
      const maxImages = Number(formData.maxImages) || 5;
      if (isNaN(price)) {
        alert("Please provide a valid price.");
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
        couponDiscount: formData.couponDiscount ? Number(formData.couponDiscount) : 0,
        productCouponCode: formData.productCouponCode || '',
        productCouponDiscount: formData.productCouponDiscount ? Number(formData.productCouponDiscount) : 0,
        images: formData.images.filter(img => img.trim() !== ''),
        maxImages: maxImages,
        isNew: formData.isNew,
        isHot: formData.isHot,
        sizes: formData.sizes || [],
        createdAt: isEditing?.createdAt || new Date().toISOString()
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
        images: [] as string[],
        maxImages: '5',
        description: '', 
        stock: 'in-stock',
        couponDiscount: '',
        productCouponCode: '',
        productCouponDiscount: '',
        isNew: true,
        isHot: false,
        sizes: [] as string[]
      });
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(`Error saving product: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!categoryData.name) {
        alert("Please provide category name.");
        setIsSaving(false);
        return;
      }

      const finalCategoryData = {
        name: categoryData.name,
        image: categoryData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        createdAt: isEditingCategory?.createdAt || new Date().toISOString()
      };

      if (isEditingCategory) {
        await updateCategory({ 
          ...finalCategoryData, 
          id: isEditingCategory.id,
        } as any);
      } else {
        await addCategory(finalCategoryData as any);
      }
      setShowCategoryForm(false);
      setIsEditingCategory(null);
      setCategoryData({ name: '', image: '' });
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(`Error saving category: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const finalSliderData = {
        ...sliderData,
        createdAt: isEditingSlider?.createdAt || new Date().toISOString()
      };

      if (isEditingSlider) {
        await updateSlider({ ...finalSliderData, id: isEditingSlider.id });
      } else {
        await addSlider(finalSliderData);
      }
      setShowSliderForm(false);
      setIsEditingSlider(null);
      setSliderData({ image: '', mobileImage: '', link: '' });
    } catch (error) {
      console.error("Error saving slider:", error);
      alert("Error saving slider. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateOrderPDF = (order: any) => {
    const doc = new jsPDF();
    
    // Add Logo or Header
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red-600
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
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 62);
    
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
      headStyles: { fillColor: [220, 38, 38] },
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
      alert('No orders today!');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
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
      headStyles: { fillColor: [220, 38, 38] },
    });

    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
    const finalY = (doc as any).lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Orders: ${todayOrders.length}`, 20, finalY + 15);
    doc.text(`Total Revenue: Tk ${totalRevenue}`, 20, finalY + 25);

    doc.save(`daily-report-${today}.pdf`);
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-red-500' },
    { label: 'Categories', value: categories.length, icon: List, color: 'bg-amber-500' },
    { label: 'Total Revenue', value: `Tk ${orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0)}`, icon: LayoutDashboard, color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
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
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 group">
              <img 
                src={user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                className="w-20 h-20 rounded-full object-cover border-2 border-red-100 group-hover:border-red-500 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="font-bold text-gray-800 line-clamp-1">{user?.displayName || 'Admin'}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Administrator</p>
            
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center justify-center space-x-1 px-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-all"
              >
                <Edit2 size={10} />
                <span>Edit Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center space-x-1 px-2 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all"
              >
                <LogOut size={10} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all mb-4 border border-gray-100"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'categories', label: 'Categories', icon: List },
            { id: 'sliders', label: 'Sliders', icon: ImageIcon },
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-red-50 text-red-600 font-semibold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 lg:hidden">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
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
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-red-600 text-sm font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle p-4 lg:p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-100">
                        <th className="pb-4 font-medium">Order ID</th>
                        <th className="pb-4 font-medium hidden sm:table-cell">Customer</th>
                        <th className="pb-4 font-medium hidden md:table-cell">Payment</th>
                        <th className="pb-4 font-medium">Total</th>
                        <th className="pb-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="text-sm">
                          <td className="py-4 font-medium">#{order.id.substring(0, 8)}</td>
                          <td className="py-4 hidden sm:table-cell">{order.customerName}</td>
                          <td className="py-4 hidden md:table-cell">
                            <div className="flex flex-col">
                              <span className="font-bold uppercase text-[10px]">{order.paymentMethod || 'COD'}</span>
                              <span className={`text-[9px] font-bold uppercase ${order.paymentStatus === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>
                                {order.paymentStatus?.replace('-', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 font-bold">Tk {order.totalAmount}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-red-100 text-red-600' :
                              order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {order.status === 'completed' ? 'Success' : 
                               order.status === 'pending' ? 'Pending' : 
                               order.status === 'cancelled' ? 'Cancelled' : 
                               order.status === 'processing' ? 'Processing' : 'Shipped'}
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
              <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
              <button
                onClick={generateDailyOrdersPDF}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Daily Report (PDF)</span>
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
                          order.status === 'completed' ? 'bg-red-100 text-red-600' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {order.status === 'completed' ? 'Success' : order.status === 'pending' ? 'Pending' : 'Cancelled'}
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
                        className="flex-1 sm:flex-none flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-5 h-5" />
                        <span className="ml-2 sm:hidden font-bold">Download PDF</span>
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Success</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  {order.paymentMethod !== 'cod' && (
                    <div className="px-4 lg:px-6 py-3 bg-red-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-red-100">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase">Method:</span>
                          <span className="text-xs font-black text-red-700 uppercase">{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase">Phone:</span>
                          <span className="text-xs font-black text-red-700">{order.paymentPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase">TxID:</span>
                          <span className="text-xs font-black text-red-700">{order.transactionId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase">Advance:</span>
                          <span className="text-xs font-black text-red-700">Tk {order.advanceAmount}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'awaiting-verification' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.paymentStatus?.replace('-', ' ')}
                        </span>
                        {order.paymentStatus === 'awaiting-verification' && (
                          <button
                            onClick={() => verifyPayment(order.id, 'verified')}
                            className="flex-1 sm:flex-none bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors"
                          >
                            Verify Payment
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h4>
                      <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                        <p className="font-bold">{order.customerName}</p>
                        <p className="text-gray-600">{order.customerPhone}</p>
                        <p className="text-gray-600 text-sm">{order.customerAddress}</p>
                        {order.note && <p className="text-amber-600 text-sm italic">Note: {order.note}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.name} {item.size ? `(${item.size})` : ''} x {item.quantity}</span>
                            <span className="font-bold">Tk {item.price * item.quantity}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-gray-500">Delivery Charge</span>
                          <span className="font-bold">Tk {order.deliveryCharge || 0}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between items-center text-red-600">
                            <span className="text-sm">Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                            <span className="font-bold">- Tk {order.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-red-600">Tk {order.totalAmount}</span>
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
              <h2 className="text-2xl font-bold">Products ({products.length})</h2>
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
                    images: [] as string[],
                    maxImages: '5',
                    description: '',
                    stock: 'in-stock',
                    couponDiscount: '',
                    productCouponCode: '',
                    productCouponDiscount: '',
                    isNew: true,
                    isHot: false,
                    sizes: [] as string[]
                  });
                  setShowProductForm(true);
                }}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Product</span>
              </button>
            </div>

            {(showProductForm || isEditing) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => { setShowProductForm(false); setIsEditing(null); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const btn = document.getElementById('product-form-submit-btn');
                          if (btn) btn.click();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Tk)</label>
                          <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Old Price</label>
                          <input
                            type="number"
                            value={formData.oldPrice}
                            onChange={e => setFormData({ ...formData, oldPrice: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                          <input
                            type="number"
                            value={formData.discount}
                            onChange={e => setFormData({ ...formData, discount: e.target.value })}
                            placeholder="Optional"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="">No Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <select
                          value={formData.stock}
                          onChange={e => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        >
                          <option value="in-stock">In Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Discount (Tk)</label>
                        <input
                          type="number"
                          value={formData.couponDiscount}
                          onChange={e => setFormData({ ...formData, couponDiscount: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Coupon Code</label>
                        <input
                          type="text"
                          value={formData.productCouponCode}
                          onChange={e => setFormData({ ...formData, productCouponCode: e.target.value })}
                          placeholder="e.g. PROTHOM"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Coupon Discount (%)</label>
                        <input
                          type="number"
                          value={formData.productCouponDiscount}
                          onChange={e => setFormData({ ...formData, productCouponDiscount: e.target.value })}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (Separate with comma)</label>
                      <input
                        type="text"
                        value={formData.sizes?.join(', ') || ''}
                        onChange={e => setFormData({ ...formData, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                        placeholder="e.g. S, M, L, XL, XXL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Main)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.image}
                          onChange={e => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Main image URL"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, (url) => setFormData(prev => ({ ...prev, image: url })))}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Gallery Images (Max {formData.maxImages || 5})</label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Limit:</span>
                          <input
                            type="number"
                            value={formData.maxImages}
                            onChange={e => setFormData({ ...formData, maxImages: e.target.value })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={img}
                              onChange={e => {
                                const newImages = [...formData.images];
                                newImages[index] = e.target.value;
                                setFormData({ ...formData, images: newImages });
                              }}
                              placeholder={`Image ${index + 1} URL`}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                            />
                            <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                              <Camera className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => handleImageUpload(e, (url) => {
                                  setFormData(prev => {
                                    const newImages = [...prev.images];
                                    newImages[index] = url;
                                    return { ...prev, images: newImages };
                                  });
                                })}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImages });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.images.length < (Number(formData.maxImages) || 5) && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors text-sm flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add More Images</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNew}
                          onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                          className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-gray-700">New Arrival</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isHot}
                          onChange={e => setFormData({ ...formData, isHot: e.target.checked })}
                          className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Hot Product</span>
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
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || isUploading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-bold"
                      >
                        {isSaving || isUploading ? 'Saving...' : 'Save'}
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
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-red-600 font-bold">Tk {product.price}</p>
                      {product.couponDiscount && (
                        <p className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          Fixed: -Tk {product.couponDiscount}
                        </p>
                      )}
                    </div>
                    {product.productCouponCode && (
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Code: {product.productCouponCode}</p>
                        <p className="text-[10px] text-red-600 font-bold">-{product.productCouponDiscount}%</p>
                      </div>
                    )}
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
                            discount: product.discount?.toString() || '',
                            couponDiscount: product.couponDiscount?.toString() || '',
                            productCouponCode: product.productCouponCode || '',
                            productCouponDiscount: product.productCouponDiscount?.toString() || '',
                            images: product.images || [],
                            maxImages: product.maxImages?.toString() || '5',
                            sizes: product.sizes || []
                          }); 
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
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
              <h2 className="text-2xl font-bold">Categories ({categories.length})</h2>
              <button
                onClick={() => {
                  setIsEditingCategory(null);
                  setCategoryData({ name: '', image: '' });
                  setShowCategoryForm(true);
                }}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Category</span>
              </button>
            </div>

            {(showCategoryForm || isEditingCategory) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => { setShowCategoryForm(false); setIsEditingCategory(null); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const btn = document.getElementById('category-form-submit-btn');
                          if (btn) btn.click();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-bold"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={categoryData.name}
                        onChange={e => setCategoryData({ ...categoryData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={categoryData.image}
                          onChange={e => setCategoryData({ ...categoryData, image: e.target.value })}
                          placeholder="Default image will be used if not provided"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, (url) => setCategoryData(prev => ({ ...prev, image: url })))}
                          />
                        </label>
                      </div>
                    </div>
                    {/* Hidden submit button to allow triggering from outside */}
                    <button type="submit" id="category-form-submit-btn" className="hidden" />

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => { setShowCategoryForm(false); setIsEditingCategory(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || isUploading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-bold"
                      >
                        {isSaving || isUploading ? 'Saving...' : 'Save'}
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
                      <p className="text-sm text-gray-500">Slug: {category.slug}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { 
                        setIsEditingCategory(category); 
                        setCategoryData({ 
                          name: category.name, 
                          image: category.image,
                        }); 
                      }}
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
              <h2 className="text-2xl font-bold">Sliders ({sliders.length})</h2>
              <button
                onClick={() => setShowSliderForm(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>New Slider</span>
              </button>
            </div>

            {(showSliderForm || isEditingSlider) && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">{isEditingSlider ? 'Edit Slider' : 'Add New Slider'}</h3>
                  <form onSubmit={handleSaveSlider} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Image URL</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          required
                          value={sliderData.image}
                          onChange={e => setSliderData({ ...sliderData, image: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, (url) => setSliderData(prev => ({ ...prev, image: url })))}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Image URL (Optional)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={sliderData.mobileImage}
                          onChange={e => setSliderData({ ...sliderData, mobileImage: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, (url) => setSliderData(prev => ({ ...prev, mobileImage: url })))}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                      <input
                        type="text"
                        value={sliderData.link}
                        onChange={e => setSliderData({ ...sliderData, link: e.target.value })}
                        placeholder="/category/panjabi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowSliderForm(false); setIsEditingSlider(null); }}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || isUploading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving || isUploading ? 'Saving...' : 'Save'}
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
                    <p className="text-sm text-gray-500 mb-4 truncate">Link: {slider.link || 'None'}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setIsEditingSlider(slider); setSliderData(slider); }}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteSlider(slider.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
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
              <h2 className="text-2xl font-bold">Users ({users.length})</h2>
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
                          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
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
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Orders</p>
                          <p className="font-bold text-lg">{userOrders.length}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Ordered</p>
                          <p className="font-bold text-lg text-gray-600">Tk {totalOrdered}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                          <p className="font-bold text-lg text-red-600">Tk {totalSpent}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Cancelled</p>
                          <p className="font-bold text-lg text-red-600">Tk {cancelledAmount}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl lg:bg-transparent lg:p-0">
                          <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                            user.isBanned ? 'bg-red-100 text-red-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                        <button
                          onClick={() => banUser(user.uid, !user.isBanned)}
                          className={`flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            user.isBanned 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                          title={user.isBanned ? 'Unban' : 'Ban'}
                        >
                          {user.isBanned ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                          <span className="lg:hidden">{user.isBanned ? 'Unban' : 'Ban'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              deleteUser(user.uid);
                            }
                          }}
                          className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="lg:hidden">Delete</span>
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
              <h2 className="text-2xl font-bold text-gray-800">Customer Reviews ({reviews.length})</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet.</p>
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
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-red-100 flex items-center justify-center bg-red-50 text-red-600 font-bold">
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
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this review?')) {
                                  deleteReview(review.productId, review.id);
                                }
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-red-600 mb-1">Product: {product?.name || 'Unknown Product'}</p>
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                          </div>

                          {review.adminReply ? (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-red-700">Your Reply</p>
                                <span className="text-[10px] text-red-400">
                                  {review.adminReplyAt && new Date(review.adminReplyAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-red-800 italic">{review.adminReply}</p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={replyText[review.id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                placeholder="Write a reply..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                              />
                              <button
                                onClick={() => {
                                  if (replyText[review.id]?.trim()) {
                                    addAdminReply(review.productId, review.id, replyText[review.id]);
                                    setReplyText({ ...replyText, [review.id]: '' });
                                  }
                                }}
                                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
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
              <h2 className="text-2xl font-bold">Settings</h2>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving || isUploading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
              >
                {isSaving || isUploading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl shadow-sm">
              <form id="settings-form" onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={localSettings.companyName || ''}
                    onChange={e => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                    placeholder="TSB SHOP BD"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website Logo (Link)</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={localSettings.logo || ''}
                      onChange={e => setLocalSettings({ ...localSettings, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageUpload(e, (url) => setLocalSettings(prev => ({ ...prev, logo: url })))}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Provide a direct image link or upload to change the logo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Charge (Inside Dhaka)</label>
                    <input
                      type="number"
                      value={localSettings.shippingCharge || 60}
                      onChange={e => setLocalSettings({ ...localSettings, shippingCharge: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Charge (Outside Dhaka)</label>
                    <input
                      type="number"
                      value={localSettings.shippingChargeOutside || 120}
                      onChange={e => setLocalSettings({ ...localSettings, shippingChargeOutside: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    value={localSettings.whatsappNumber}
                    onChange={e => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Link</label>
                      <input
                        type="text"
                        value={localSettings.facebookLink || ''}
                        onChange={e => setLocalSettings({ ...localSettings, facebookLink: e.target.value })}
                        placeholder="https://facebook.com/yourpage"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Link</label>
                      <input
                        type="text"
                        value={localSettings.twitterLink || ''}
                        onChange={e => setLocalSettings({ ...localSettings, twitterLink: e.target.value })}
                        placeholder="https://twitter.com/yourhandle"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Link</label>
                      <input
                        type="text"
                        value={localSettings.youtubeLink || ''}
                        onChange={e => setLocalSettings({ ...localSettings, youtubeLink: e.target.value })}
                        placeholder="https://youtube.com/yourchannel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Link</label>
                      <input
                        type="text"
                        value={localSettings.instagramLink || ''}
                        onChange={e => setLocalSettings({ ...localSettings, instagramLink: e.target.value })}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Link</label>
                      <input
                        type="text"
                        value={localSettings.linkedinLink || ''}
                        onChange={e => setLocalSettings({ ...localSettings, linkedinLink: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slider Subtitle</label>
                  <input
                    type="text"
                    value={localSettings.sliderTitle || ''}
                    onChange={e => setLocalSettings({ ...localSettings, sliderTitle: e.target.value })}
                    placeholder="e.g., Our New Collection"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4">Notice Bar Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">Show Notice Bar</p>
                        <p className="text-xs text-gray-500">Enable or disable the top notice bar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, showNotice: !localSettings.showNotice })}
                        className={`w-14 h-8 rounded-full transition-all relative ${localSettings.showNotice ? 'bg-red-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.showNotice ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notice Text</label>
                      <textarea
                        rows={2}
                        value={localSettings.noticeText || ''}
                        onChange={e => setLocalSettings({ ...localSettings, noticeText: e.target.value })}
                        placeholder="e.g., Welcome to TM SHOP BD! Enjoy your shopping."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4">Payment Settings</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway Image (Link)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={localSettings.paymentGatewayImage || ''}
                          onChange={e => setLocalSettings({ ...localSettings, paymentGatewayImage: e.target.value })}
                          placeholder="https://example.com/payment-gateways.png"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <label className="cursor-pointer p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageUpload(e, (url) => setLocalSettings(prev => ({ ...prev, paymentGatewayImage: url })))}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Provide a direct image link or upload for the payment gateway logos in the footer.</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">Show Payment Gateway Image</p>
                        <p className="text-xs text-gray-500">Enable or disable the payment gateway logos in the footer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, showPaymentGateway: !localSettings.showPaymentGateway })}
                        className={`w-14 h-8 rounded-full transition-all relative ${localSettings.showPaymentGateway ? 'bg-red-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localSettings.showPaymentGateway ? 'left-7' : 'left-1'}`}  />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">bKash Number</label>
                      <input
                        type="text"
                        value={localSettings.bkashNumber || ''}
                        onChange={e => setLocalSettings({ ...localSettings, bkashNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nagad Number</label>
                      <input
                        type="text"
                        value={localSettings.nagadNumber || ''}
                        onChange={e => setLocalSettings({ ...localSettings, nagadNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rocket Number</label>
                      <input
                        type="text"
                        value={localSettings.rocketNumber || ''}
                        onChange={e => setLocalSettings({ ...localSettings, rocketNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment (%)</label>
                      <input
                        type="number"
                        value={localSettings.advancePaymentPercentage || 0}
                        onChange={e => setLocalSettings({ ...localSettings, advancePaymentPercentage: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4">Support Center Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Title</label>
                        <input
                          type="text"
                          value={localSettings.supportTitle || ''}
                          onChange={e => setLocalSettings({ ...localSettings, supportTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Description</label>
                        <input
                          type="text"
                          value={localSettings.supportDescription || ''}
                          onChange={e => setLocalSettings({ ...localSettings, supportDescription: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="font-bold text-gray-800">Call Support</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Call Title</label>
                          <input
                            type="text"
                            value={localSettings.supportCallTitle || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportCallTitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Call Description</label>
                          <input
                            type="text"
                            value={localSettings.supportCallDescription || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportCallDescription: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="text"
                            value={localSettings.supportPhoneNumber || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportPhoneNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Support Hours</label>
                          <input
                            type="text"
                            value={localSettings.supportHours || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportHours: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="font-bold text-gray-800">Search Settings</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Overlay Categories (Comma separated)</label>
                        <input
                          type="text"
                          value={localSettings.searchCategories || ''}
                          onChange={e => setLocalSettings({ ...localSettings, searchCategories: e.target.value })}
                          placeholder="e.g. Badminton, Cricket, Football"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">These categories will appear in the search overlay for quick filtering.</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="font-bold text-gray-800">WhatsApp Support</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Title</label>
                          <input
                            type="text"
                            value={localSettings.supportWhatsappTitle || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportWhatsappTitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Description</label>
                          <input
                            type="text"
                            value={localSettings.supportWhatsappDescription || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportWhatsappDescription: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                          <input
                            type="text"
                            value={localSettings.supportWhatsappNumber || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportWhatsappNumber: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Response Time</label>
                          <input
                            type="text"
                            value={localSettings.supportWhatsappResponseTime || ''}
                            onChange={e => setLocalSettings({ ...localSettings, supportWhatsappResponseTime: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
