import { Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  
  return (
    <footer className="bg-white text-gray-900 pt-12 pb-24 lg:pb-12 border-t border-gray-100">
      <div className="container px-4">
        {/* Payment Gateway */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-bold mb-2">Secure Payment Gateway</h3>
          <div className="w-12 h-1 bg-gray-200 mx-auto mb-6"></div>
          <div className="max-w-md mx-auto aspect-[3/1] bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={settings.paymentGatewayImage} 
              alt="Payment Gateways" 
              className="w-full h-full object-contain shadow-sm" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>

        {/* Copyright & Developer */}
        <div className="text-center space-y-2 text-gray-500 text-sm border-t border-gray-100 pt-8">
          <p>© 2026 TSB SHOP BD. All rights reserved.</p>
          <p>Developed by: <span className="text-red-600 font-bold">TSB SHOP BD Team</span></p>
        </div>
      </div>
    </footer>
  );
}
