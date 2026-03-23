import React, { useState } from 'react';
import { MessageCircle, X, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

const FloatingSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useStore();

  const whatsappUrl = `https://wa.me/${settings.supportWhatsappNumber?.replace(/\D/g, '')}`;
  const messengerUrl = settings.supportMessengerLink || `https://m.me/${settings.messengerLink?.split('/').pop()}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-72"
          >
            <div className="bg-red-600 p-4 text-white">
              <h3 className="font-bold text-lg">{settings.supportTitle || 'Help Center'}</h3>
              <p className="text-xs opacity-90">{settings.supportDescription || 'How can we help you today?'}</p>
            </div>
            
            <div className="p-2 space-y-1">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{settings.supportWhatsappTitle || 'WhatsApp'}</p>
                  <p className="text-xs text-gray-500">{settings.supportWhatsappDescription || 'Chat with us on WhatsApp'}</p>
                </div>
              </a>

              <a 
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{settings.supportMessengerTitle || 'Messenger'}</p>
                  <p className="text-xs text-gray-500">{settings.supportMessengerDescription || 'Chat with us on Messenger'}</p>
                </div>
              </a>
            </div>
            
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                {settings.supportHours || 'Available Sat-Thu: 9AM - 8PM'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-red-600 hover:scale-110'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingSupport;
