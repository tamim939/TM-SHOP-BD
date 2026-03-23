export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isHot?: boolean;
  description?: string;
  sizes?: string[];
  images?: string[];
  maxImages?: number;
  stock?: 'in-stock' | 'out-of-stock';
  couponDiscount?: number;
  productCouponCode?: string;
  productCouponDiscount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  categoryCouponCode?: string;
  categoryCouponDiscount?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  slug?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  note?: string;
  deliveryCharge?: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  paymentPhone?: string;
  transactionId?: string;
  advanceAmount?: number;
  dueAmount?: number;
  paymentStatus?: 'pending' | 'verified' | 'failed' | 'awaiting-verification';
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

export interface Slider {
  id: string;
  image: string;
  mobileImage?: string;
  link?: string;
}

export interface Review {
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

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isBanned?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  isAdmin: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string; // userId
  userName: string;
  userPhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
}

export interface Settings {
  paymentGatewayImage: string;
  whatsappNumber: string;
  whatsappMessage: string;
  messengerLink?: string;
  sliderTitle?: string;
  logo?: string;
  companyName?: string;
  shippingCharge?: number;
  shippingChargeOutside?: number;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  advancePaymentPercentage?: number;
  showNotice?: boolean;
  noticeText?: string;
  showPaymentGateway?: boolean;
  facebookLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
  instagramLink?: string;
  linkedinLink?: string;
  supportTitle?: string;
  supportDescription?: string;
  supportCallTitle?: string;
  supportCallDescription?: string;
  supportPhoneNumber?: string;
  supportHours?: string;
  supportWhatsappTitle?: string;
  supportWhatsappDescription?: string;
  supportWhatsappNumber?: string;
  supportWhatsappResponseTime?: string;
}
