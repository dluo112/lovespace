'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Map, TreeDeciduous, Heart } from 'lucide-react';
import LoveTree from './LoveTree';
import LoveMap from './LoveMap';

interface SecretSpaceProps {
    daysTogether: number;
    memoryCount: number;
}

interface Bubble {
    id: number;
    top: string;
    left: string;
    width: number;
    height: number;
    duration: number;
    background: string;
}

export default function SecretSpace({ daysTogether, memoryCount }: SecretSpaceProps) {
    const [bubbles, setBubbles] = useState<Bubble[]>([]);

    useEffect(() => {
        setBubbles(Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            duration: Math.random() * 5 + 5,
            background: i % 2 === 0 ? '#FBCFE8' : '#BAE6FD',
        })));
    }, []);

  return (
    <div className="w-full h-[400px] bg-gradient-to-br from-pink-50 via-white to-blue-50 relative overflow-hidden flex flex-col items-center justify-center text-slate-700">
        {/* Soft Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Floating Bubbles */}
            {bubbles.map((bubble) => (
                <motion.div
                    key={bubble.id}
                    className="absolute rounded-full blur-xl opacity-40"
                    style={{
                        background: bubble.background, // Pink & Blue
                        top: bubble.top,
                        left: bubble.left,
                        width: bubble.width,
                        height: bubble.height,
                    }}
                    animate={{ 
                        y: [0, -20, 0], 
                        x: [0, 10, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3] 
                    }}
                    transition={{ duration: bubble.duration, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>

        <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
                <h3 className="font-serif italic text-3xl flex items-center justify-center gap-2 text-slate-800">
                    <Sparkles size={24} className="text-yellow-400 fill-yellow-400" />
                    我们的秘密基地
                </h3>
                <p className="text-xs text-slate-500 tracking-[0.2em] uppercase font-medium">探索我们的旅程</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
                {/* Entry A: Love Tree */}
                <Link href="/admin/secret/tree" className="group relative">
                    <motion.div 
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-3xl flex flex-col items-center gap-4 h-48 justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                         {/* Decorative Background */}
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100/50 rounded-full blur-2xl transition-all group-hover:bg-green-200/50" />
                         
                         <div className="relative z-10 h-24 w-full flex items-center justify-center">
                             {/* Mini Tree Preview */}
                             <div className="scale-50 origin-center translate-y-4 opacity-90 group-hover:opacity-100 transition-opacity">
                                <LoveTree daysTogether={daysTogether} memoryCount={memoryCount} />
                             </div>
                         </div>
                         
                         <div className="text-center z-10">
                             <h4 className="font-semibold text-slate-700 flex items-center justify-center gap-1.5 text-sm">
                                <div className="p-1.5 bg-green-100 rounded-full text-green-600">
                                    <TreeDeciduous size={14} />
                                </div>
                                恋爱树
                             </h4>
                             <p className="text-[10px] text-slate-400 mt-1 font-medium">用爱灌溉</p>
                         </div>
                    </motion.div>
                </Link>

                {/* Entry B: Love Map */}
                <Link href="/admin/secret/map" className="group relative">
                    <motion.div 
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-3xl flex flex-col items-center gap-4 h-48 justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                         {/* Decorative Background */}
                         <div className="absolute -top-10 -left-10 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl transition-all group-hover:bg-pink-200/50" />
                         
                         <div className="relative z-10 h-24 w-full flex items-center justify-center overflow-hidden">
                             {/* Mini Map Preview */}
                             <div className="scale-75 opacity-90 group-hover:opacity-100 transition-opacity">
                                <LoveMap />
                             </div>
                         </div>
                         
                         <div className="text-center z-10">
                             <h4 className="font-semibold text-slate-700 flex items-center justify-center gap-1.5 text-sm">
                                <div className="p-1.5 bg-pink-100 rounded-full text-pink-500">
                                    <Map size={14} />
                                </div>
                                足迹地图
                             </h4>
                             <p className="text-[10px] text-slate-400 mt-1 font-medium">我们在哪儿</p>
                         </div>
                    </motion.div>
                </Link>
            </div>
        </div>
        
        {/* Gradient Overlay for seamless transition to main content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </div>
  );
}
