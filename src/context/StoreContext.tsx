import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, OrderItem, Category, Slider, Settings, ChatMessage, ChatSession, Coupon } from '../types';
import { PRODUCTS } from '../constants';
import { db, auth } from '../firebase';
import { ref, onValue, set, push, remove, update, query, orderByChild, equalTo, limitToLast, increment } from 'firebase/database';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';

const ADMIN_EMAILS = ['rsjonayed07@gmail.com', 'tamimbhai23@gmail.com'];

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
  adminReply?: string;
  adminReplyAt?: string;
}

interface DBUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  isBanned: boolean;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  sliders: Slider[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  cart: OrderItem[];
  wishlist: string[];
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  settingsLoaded: boolean;
  productsLoaded: boolean;
  categoriesLoaded: boolean;
  slidersLoaded: boolean;
  isAppReady: boolean;
  settings: Settings;
  updateSettings: (settings: Settings) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSlider: (slider: Omit<Slider, 'id'>) => Promise<void>;
  updateSlider: (slider: Slider) => Promise<void>;
  deleteSlider: (id: string) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<void>;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  deleteReview: (productId: string, reviewId: string) => Promise<void>;
  addAdminReply: (productId: string, reviewId: string, reply: string) => Promise<void>;
  banUser: (userId: string, status: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
  allUsers: DBUser[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  sendMessage: (text: string) => Promise<void>;
  sendAdminMessage: (userId: string, text: string) => Promise<void>;
  messages: ChatMessage[];
  chatSessions: ChatSession[];
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '') // Allow Bengali characters
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allUsers, setAllUsers] = useState<DBUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatUserId, _setActiveChatUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    paymentGatewayImage: 'https://i.ibb.co.com/1Y2vX4sd/new-payment-gateway.png',
    whatsappNumber: '01909338635',
    whatsappMessage: 'Hello',
    messengerLink: 'https://m.me/yourpage',
    sliderTitle: 'আমাদের নতুন কালেকশন',
    logo: '',
    companyName: 'TSB SHOP BD',
    shippingCharge: 60,
    shippingChargeOutside: 120
  });
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [slidersLoaded, setSlidersLoaded] = useState(false);
  const ADMIN_EMAILS = ['rsjonayed07@gmail.com', 'tamimbhai23@gmail.com'];
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('panjabi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('panjabi_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Auth State
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false);
      if (currentUser) {
        // Sync user to database if not exists
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (!snapshot.exists()) {
            set(userRef, {
              uid: currentUser.uid,
              name: currentUser.displayName || 'User',
              email: currentUser.email,
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
              isBanned: false
            });
          } else {
            const data = snapshot.val();
            const updates: any = {};
            if (currentUser.displayName && data.name !== currentUser.displayName) {
              updates.name = currentUser.displayName;
            }
            if (currentUser.photoURL && data.photoURL !== currentUser.photoURL) {
              updates.photoURL = currentUser.photoURL;
            }
            if (Object.keys(updates).length > 0) {
              update(userRef, updates);
            }
          }
        }, { onlyOnce: true });
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Products
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProducts(productList);
      } else {
        setProducts([]);
      }
      setProductsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync Categories
  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoryList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setCategories(categoryList);
      } else {
        setCategories([]);
      }
      setCategoriesLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync Sliders
  useEffect(() => {
    const slidersRef = ref(db, 'sliders');
    const unsubscribe = onValue(slidersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sliderList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setSliders(sliderList);
      } else {
        setSliders([]);
      }
      setSlidersLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync Coupons
  useEffect(() => {
    const couponsRef = ref(db, 'coupons');
    const unsubscribe = onValue(couponsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const couponList = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setCoupons(couponList);
      } else {
        setCoupons([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Settings
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Clear old logo if it's still there
        if (data.logo === 'https://smartpanjabishop.com/public//storage/images/general_setting/i8Soo85A8QQI3onuvoPpRgi0UgFo2pXGXJnqG6i3.png') {
          data.logo = '';
          // Also update it in the database to permanently remove it
          update(ref(db, 'settings'), { logo: '' });
        }
        setSettings(prev => ({ ...prev, ...data }));
        setSettingsLoaded(true);
      } else {
        setSettingsLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Orders
  useEffect(() => {
    if (authLoading) return;

    let ordersRef;
    if (isAdmin) {
      ordersRef = ref(db, 'orders');
    } else if (user) {
      ordersRef = query(ref(db, 'orders'), orderByChild('userId'), equalTo(user.uid));
    } else {
      setOrders([]);
      return;
    }

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map(key => {
          const orderData = data[key];
          return {
            ...orderData,
            id: key,
            date: orderData.date || orderData.createdAt
          };
        }).sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, [user, isAdmin, authLoading]);

  // Sync Users
  useEffect(() => {
    if (!isAdmin) {
      setAllUsers([]);
      return;
    }
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map(key => ({
          ...data[key],
          uid: key
        }));
        setAllUsers(userList);
      } else {
        setAllUsers([]);
      }
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Chat Logic
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    // Determine which messages to listen to
    let messagesRef;
    if (isAdmin && activeChatUserId) {
      // Admin viewing a specific user's chat in Admin Panel
      messagesRef = query(ref(db, `messages/${activeChatUserId}`), limitToLast(50));
    } else {
      // Regular user or Admin viewing their own chat in Widget
      messagesRef = query(ref(db, `messages/${user.uid}`), limitToLast(50));
    }

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setMessages(list);
      } else {
        setMessages([]);
      }
    });

    // Also listen to sessions if admin
    let sessionsUnsubscribe = () => {};
    if (isAdmin) {
      const sessionsRef = ref(db, 'chat_sessions');
      sessionsUnsubscribe = onValue(sessionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          })).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
          setChatSessions(list);
        } else {
          setChatSessions([]);
        }
      });
    }

    return () => {
      unsubscribe();
      sessionsUnsubscribe();
    };
  }, [user, isAdmin, activeChatUserId]);

  const sendMessage = async (text: string) => {
    if (!user) {
      console.error("No user found for sendMessage");
      return;
    }
    
    try {
      const messageData = {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        senderPhoto: user.photoURL || '',
        isAdmin: false,
        timestamp: new Date().toISOString()
      };
      
      const messagesRef = ref(db, `messages/${user.uid}`);
      await push(messagesRef, messageData);

      // Update session
      const sessionRef = ref(db, `chat_sessions/${user.uid}`);
      
      // Use a single set/update to ensure session exists and count is incremented
      // We'll use a transaction-like approach or just check existence
      const sessionData = {
        userName: user.displayName || 'User',
        userPhoto: user.photoURL || '',
        lastMessage: text,
        lastMessageTime: new Date().toISOString(),
      };

      // Try to increment, if it fails it's likely because the node doesn't exist
      // But in RTDB update can create nodes. However increment needs a number.
      await update(sessionRef, {
        ...sessionData,
        unreadCount: increment(1)
      }).catch(async () => {
        // Fallback for first message
        await set(sessionRef, {
          ...sessionData,
          unreadCount: 1
        });
      });
      
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  };

  const sendAdminMessage = async (userId: string, text: string) => {
    if (!user || !isAdmin) return;
    const messageData = {
      text,
      senderId: user.uid,
      senderName: 'Admin',
      senderPhoto: user.photoURL || '',
      isAdmin: true,
      timestamp: new Date().toISOString()
    };
    
    const messagesRef = ref(db, `messages/${userId}`);
    await push(messagesRef, messageData);

    // Update session
    const sessionRef = ref(db, `chat_sessions/${userId}`);
    await update(sessionRef, {
      lastMessage: text,
      lastMessageTime: new Date().toISOString()
    }).catch(() => {});
  };

  const setActiveChatUserId = (id: string | null) => {
    _setActiveChatUserId(id);
    if (id && isAdmin) {
      // Reset unread count when admin opens the chat
      const sessionRef = ref(db, `chat_sessions/${id}`);
      update(sessionRef, { unreadCount: 0 }).catch(() => {});
    }
  };

  // Sync Reviews
  useEffect(() => {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewList: Review[] = [];
        Object.keys(data).forEach(productId => {
          const productReviews = data[productId];
          if (productReviews && typeof productReviews === 'object') {
            Object.keys(productReviews).forEach(reviewId => {
              const review = productReviews[reviewId];
              if (review && typeof review === 'object') {
                reviewList.push({
                  ...review,
                  id: reviewId,
                  productId
                });
              }
            });
          }
        });
        setReviews(reviewList);
      } else {
        setReviews([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('panjabi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('panjabi_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const productsRef = ref(db, 'products');
      const newProductRef = push(productsRef);
      const slug = generateSlug(product.name);
      // Default isNew to true if not specified
      const isNew = product.isNew !== undefined ? product.isNew : true;
      await set(newProductRef, { ...product, id: newProductRef.key, slug, isNew });
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const productRef = ref(db, `products/${updatedProduct.id}`);
      const slug = generateSlug(updatedProduct.name);
      await set(productRef, { ...updatedProduct, slug });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productRef = ref(db, `products/${id}`);
      await remove(productRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const categoriesRef = ref(db, 'categories');
      const newCategoryRef = push(categoriesRef);
      const slug = generateSlug(category.name);
      await set(newCategoryRef, { ...category, id: newCategoryRef.key, slug });
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    try {
      const categoryRef = ref(db, `categories/${updatedCategory.id}`);
      const slug = generateSlug(updatedCategory.name);
      await set(categoryRef, { ...updatedCategory, slug });
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const categoryRef = ref(db, `categories/${id}`);
      await remove(categoryRef);
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  const addSlider = async (slider: Omit<Slider, 'id'>) => {
    try {
      const slidersRef = ref(db, 'sliders');
      const newSliderRef = push(slidersRef);
      await set(newSliderRef, { ...slider, id: newSliderRef.key });
    } catch (error) {
      console.error("Error adding slider:", error);
      throw error;
    }
  };

  const updateSlider = async (updatedSlider: Slider) => {
    try {
      const sliderRef = ref(db, `sliders/${updatedSlider.id}`);
      await set(sliderRef, updatedSlider);
    } catch (error) {
      console.error("Error updating slider:", error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      const settingsRef = ref(db, 'settings');
      await set(settingsRef, newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  const deleteSlider = async (id: string) => {
    try {
      const sliderRef = ref(db, `sliders/${id}`);
      await remove(sliderRef);
    } catch (error) {
      console.error("Error deleting slider:", error);
      throw error;
    }
  };

  const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
    try {
      const couponsRef = ref(db, 'coupons');
      const newCouponRef = push(couponsRef);
      await set(newCouponRef, { ...coupon, id: newCouponRef.key });
    } catch (error) {
      console.error("Error adding coupon:", error);
      throw error;
    }
  };

  const updateCoupon = async (updatedCoupon: Coupon) => {
    try {
      const couponRef = ref(db, `coupons/${updatedCoupon.id}`);
      await set(couponRef, updatedCoupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      throw error;
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const couponRef = ref(db, `coupons/${id}`);
      await remove(couponRef);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      throw error;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, { ...order, id: newOrderRef.key, userId: user?.uid || null });
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await remove(orderRef);
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };

  const banUser = async (userId: string, status: boolean) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, { isBanned: status });
    } catch (error) {
      console.error("Error banning user:", error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await remove(userRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const updateUserProfile = async (data: { name?: string; photoURL?: string }) => {
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName: data.name || user.displayName,
        photoURL: data.photoURL || user.photoURL
      });
      
      // Update DB
      const userRef = ref(db, `users/${user.uid}`);
      const updates: any = {};
      if (data.name) updates.name = data.name;
      if (data.photoURL) updates.photoURL = data.photoURL;
      await update(userRef, updates);

      // Update Chat Session if exists
      const sessionRef = ref(db, `chat_sessions/${user.uid}`);
      const sessionUpdates: any = {};
      if (data.name) sessionUpdates.userName = data.name;
      if (data.photoURL) sessionUpdates.userPhoto = data.photoURL;
      await update(sessionRef, sessionUpdates).catch(() => {}); // Ignore if session doesn't exist
      
      // Force refresh user state
      setUser({ ...user, displayName: data.name || user.displayName, photoURL: data.photoURL || user.photoURL } as User);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const addReview = async (review: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const reviewRef = push(ref(db, `reviews/${review.productId}`));
      const dbUser = allUsers.find(u => u.uid === review.userId);
      await set(reviewRef, {
        ...review,
        userPhoto: dbUser?.photoURL || user?.photoURL || '',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  };

  const deleteReview = async (productId: string, reviewId: string) => {
    try {
      const reviewRef = ref(db, `reviews/${productId}/${reviewId}`);
      await remove(reviewRef);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  };

  const addAdminReply = async (productId: string, reviewId: string, reply: string) => {
    try {
      const reviewRef = ref(db, `reviews/${productId}/${reviewId}`);
      await update(reviewRef, {
        adminReply: reply,
        adminReplyAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding admin reply:", error);
      throw error;
    }
  };

  const addToCart = (item: OrderItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.size === item.size);
      if (existing) {
        return prev.map(i => i.productId === item.productId && i.size === item.size 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const isAppReady = settingsLoaded && productsLoaded && categoriesLoaded && slidersLoaded && !authLoading;

  return (
    <StoreContext.Provider value={{ 
      products, 
      categories,
      sliders,
      coupons,
      orders, 
      reviews,
      cart, 
      wishlist,
      user,
      isAdmin,
      authLoading,
      settingsLoaded,
      settings,
      updateSettings,
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addCategory,
      updateCategory,
      deleteCategory,
      addSlider,
      updateSlider,
      deleteSlider,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      addOrder, 
      updateOrderStatus,
      deleteOrder,
      addReview,
      deleteReview,
      addAdminReply,
      banUser,
      deleteUser,
      updateUserProfile,
      allUsers,
      addToCart,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isInWishlist,
      sendMessage,
      sendAdminMessage,
      messages,
      chatSessions,
      activeChatUserId,
      setActiveChatUserId,
      isAppReady,
      productsLoaded,
      categoriesLoaded,
      slidersLoaded
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
