import { Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  
  return (
    <footer className="bg-white text-gray-900 pt-12 pb-24 lg:pb-12 border-t border-gray-100">
      <div className="container px-4">
        {/* Payment Gateway */}
        {settings.showPaymentGateway && (
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
        )}

        {/* Social Links */}
        <div className="flex flex-col items-center mb-12">
          <h3 className="text-lg font-bold mb-6">Connect With Us</h3>
          <div className="flex items-center space-x-6">
            {settings.messengerLink && (
              <a href={settings.messengerLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <MessageCircle size={24} />
              </a>
            )}
            {settings.supportWhatsappNumber && (
              <a href={`https://wa.me/${settings.supportWhatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <MessageSquare size={24} />
              </a>
            )}
            {settings.instagramLink && (
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <Instagram size={24} />
              </a>
            )}
            {settings.youtubeLink && (
              <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-md">
                <Youtube size={24} />
              </a>
            )}
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
