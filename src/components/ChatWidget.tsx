import React, { useState } from 'react';
import { MessageSquare, X, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.006c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const ChatWidget: React.FC = () => {
  const { settings, authLoading } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const welcomeMessages = [
    "Assalamu Alaikum! We are online.",
    "How can we help you?",
    "Check out our new collection!"
  ];

  React.useEffect(() => {
    if (showWelcome && !isOpen) {
      const timer = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % welcomeMessages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [showWelcome, isOpen]);

  if (authLoading) return null;

  const handleWhatsApp = () => {
    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleMessenger = () => {
    if (settings.messengerLink) {
      window.open(settings.messengerLink, '_blank');
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      <AnimatePresence mode="wait">
        {showWelcome && !isOpen && (
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-white p-3 rounded-2xl shadow-xl border border-emerald-100 min-w-[200px] mb-2"
          >
            <button 
              onClick={() => setShowWelcome(false)}
              className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
            >
              <X size={12} />
            </button>
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600">{settings.companyName || 'TSB SHOP BD'}</p>
                <p className="text-sm text-gray-700">{welcomeMessages[messageIndex]}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col space-y-3 mb-3">
            {/* Messenger Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={handleMessenger}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all"
              title="Messenger"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.453 5.51 3.735 7.263.194.15.314.382.314.632v2.388c0 .43.488.677.837.426l2.64-1.902a.8.8 0 01.465-.15h.009c.642.103 1.304.158 1.98.158 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.14 12.396l-2.58-2.753-5.03 2.753 5.52-5.86 2.63 2.753 4.98-2.753-5.52 5.86z"/>
              </svg>
            </motion.button>

            {/* WhatsApp Button */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: 0.1 }}
              onClick={handleWhatsApp}
              className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all"
              title="WhatsApp"
            >
              <WhatsAppIcon size={24} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
          isOpen ? 'bg-gray-800' : 'bg-emerald-600'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
