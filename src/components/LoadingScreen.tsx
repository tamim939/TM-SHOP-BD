import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[100]">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-100 border-t-red-600 rounded-full"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-red-600 rounded-full" />
        </motion.div>
      </div>
      <p className="mt-6 text-sm text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading TM SHOP BD...</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-12 px-8 py-3 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
      >
        Reload Page
      </button>
    </div>
  );
}
