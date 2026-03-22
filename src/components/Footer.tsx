import { Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { settings } = useStore();
  
  return (
    <footer className="bg-white text-gray-900 pt-12 pb-24 lg:pb-12 border-t border-gray-100">
      <div className="container px-4">
        {/* Social Media */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-bold mb-2">Social Media</h3>
          <div className="w-12 h-1 bg-gray-200 mx-auto mb-6"></div>
          <div className="flex justify-center gap-3">
            {settings.facebookLink && (
              <a href={settings.facebookLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
            )}
            {settings.twitterLink && (
              <a href={settings.twitterLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            )}
            <a href={`https://wa.me/88${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
              <MessageCircle size={18} />
            </a>
            {settings.youtubeLink && (
              <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                <Youtube size={18} />
              </a>
            )}
            {settings.instagramLink && (
              <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
            )}
            {settings.linkedinLink && (
              <a href={settings.linkedinLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-bold mb-2">Secure Payment Gateway</h3>
          <div className="w-12 h-1 bg-gray-200 mx-auto mb-6"></div>
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
        <div className="text-center space-y-2 text-gray-500 text-sm border-t border-gray-100 pt-8">
          <p>© 2026 TSB SHOP BD. All rights reserved.</p>
          <p>Developed by: <span className="text-red-600 font-bold">TSB SHOP BD Team</span></p>
        </div>
      </div>
    </footer>
  );
}
