import { Phone, MessageCircle, ChevronLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';

export default function Support() {
  const navigate = useNavigate();
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container px-4 h-16 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="ml-2 font-black text-lg text-gray-900">Support Center</h1>
        </div>
      </div>

      <div className="container px-4 py-8 max-w-2xl mx-auto">
        {/* Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <MessageCircle className="text-red-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{settings.supportTitle}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {settings.supportDescription}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Call Support */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
              <Phone className="text-blue-600 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-900 mb-1">{settings.supportCallTitle}</h3>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                {settings.supportCallDescription}
              </p>
              <div className="space-y-3">
                <a 
                  href={`tel:${settings.supportPhoneNumber}`}
                  className="block w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-center shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  {settings.supportPhoneNumber}
                </a>
                <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <Clock size={12} />
                  <span>{settings.supportHours}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* WhatsApp Support */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start space-x-4"
          >
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
              <MessageCircle className="text-green-600 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-900 mb-1">{settings.supportWhatsappTitle}</h3>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                {settings.supportWhatsappDescription}
              </p>
              <div className="space-y-3">
                <a 
                  href={`https://wa.me/${settings.supportWhatsappNumber?.replace(/\+/g, '').replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] text-white py-3 rounded-2xl font-black text-center shadow-lg shadow-green-100 active:scale-95 transition-all"
                >
                  WhatsApp
                </a>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-900">{settings.supportWhatsappNumber}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1 italic">{settings.supportWhatsappResponseTime}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-12">
          TM SHOP BD Support Team
        </p>
      </div>
    </div>
  );
}
