'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function LoveMap() {
  return (
    <div className="relative w-48 h-48 rounded-full bg-slate-800/50 border-4 border-slate-700/50 overflow-hidden shadow-inner backdrop-blur-sm">
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
           <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
           </pattern>
           <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radar Scan Effect */}
      <motion.div
        className="absolute inset-0 border-b-2 border-emerald-500/50 bg-gradient-to-b from-transparent to-emerald-500/10"
        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Me */}
      <motion.div 
        className="absolute top-1/3 left-1/3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative">
            <MapPin size={24} className="text-blue-400 fill-blue-400/20" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-400/20 rounded-full animate-ping" />
        </div>
      </motion.div>

      {/* Partner */}
      <motion.div 
        className="absolute bottom-1/3 right-1/3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
         <div className="relative">
            <MapPin size={24} className="text-pink-400 fill-pink-400/20" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-pink-400/20 rounded-full animate-ping" />
        </div>
      </motion.div>
      
      <div className="absolute bottom-2 left-0 right-0 text-center">
         <span className="text-[10px] text-slate-400 uppercase tracking-widest">爱情雷达</span>
      </div>
    </div>
  );
}
