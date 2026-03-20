import { Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  
  return (
    <footer className="bg-[#0a1128] text-white pt-12 pb-24 lg:pb-12">
      <div className="container px-4">
        {/* Links Section */}
        <div className="grid grid-cols-2 gap-8 mb-12 text-center md:text-left">
          <div className="space-y-3">
            <Link to="/order-procedure" className="block text-gray-300 hover:text-white transition-colors text-sm">Order procedure</Link>
            <Link to="/delivery-rules" className="block text-gray-300 hover:text-white transition-colors text-sm">Delivery Rules</Link>
            <Link to="/return-policy" className="block text-gray-300 hover:text-white transition-colors text-sm">Return Policy</Link>
          </div>
          <div className="space-y-3">
            <Link to="/return-policy" className="block text-gray-300 hover:text-white transition-colors text-sm">Return Policy</Link>
            <Link to="/terms" className="block text-gray-300 hover:text-white transition-colors text-sm">Terms & Conditions</Link>
            <Link to="/privacy" className="block text-gray-300 hover:text-white transition-colors text-sm">Privacy Policy</Link>
          </div>
        </div>

        {/* Social Media */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-bold mb-2">সোশ্যাল মিডিয়া</h3>
          <div className="w-12 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="flex justify-center gap-3">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors">
              <Twitter size={18} />
            </a>
            <a href={`https://wa.me/88${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
              <MessageCircle size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
              <Youtube size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-bold mb-2">নিরাপদ পেমেন্ট গেটওয়ে</h3>
          <div className="w-12 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="max-w-md mx-auto">
            <img 
              src={settings.paymentGatewayImage} 
              alt="Payment Gateways" 
              className="w-full h-auto rounded-lg shadow-sm" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>

        {/* Copyright & Developer */}
        <div className="text-center space-y-2 text-gray-400 text-sm border-t border-white/5 pt-8">
          <p>© 2026 TSB SHOP BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <p>Developed by: <span className="text-yellow-500">TSB SHOP BD Team</span></p>
        </div>
      </div>
    </footer>
  );
}
