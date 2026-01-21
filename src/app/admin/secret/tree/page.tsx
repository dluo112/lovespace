'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getMemories } from '@/app/actions/admin';
import { getSystemSettings } from '@/app/actions/settings';
import { ArrowLeft, CloudRain, Sun, Moon, CloudFog, Sparkles, Cloud } from 'lucide-react';
import Link from 'next/link';
import LoveTree from '@/components/LoveTree';
import { motion, AnimatePresence } from 'framer-motion';

type WeatherType = 'sunny' | 'night' | 'rainy' | 'foggy';

export default function TreePage() {
    const [stats, setStats] = useState({ days: 0, memories: 0 });
    const [weather, setWeather] = useState<WeatherType>('sunny');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function load() {
            const [memRes, setRes] = await Promise.all([
                getMemories(),
                getSystemSettings()
            ]);
            
            const startDate = setRes.data?.startDate ? new Date(setRes.data.startDate) : new Date();
            const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            setStats({ days, memories: memRes.data?.length || 0 });
        }
        load();

        // Determine weather based on time and random chance
        const hour = new Date().getHours();
        const rand = Math.random();

        if (hour < 6 || hour > 19) {
            setWeather('night');
        } else {
            // Daytime probabilities
            if (rand > 0.8) setWeather('rainy');
            else if (rand > 0.7) setWeather('foggy');
            else setWeather('sunny');
        }
    }, []);

    // Dynamic Sky Colors
    const skyGradient = useMemo(() => {
        switch (weather) {
            case 'night': return 'from-slate-900 via-indigo-950 to-slate-900';
            case 'rainy': return 'from-slate-400 via-slate-300 to-slate-400';
            case 'foggy': return 'from-slate-200 via-slate-100 to-white';
            case 'sunny': default: return 'from-sky-300 via-sky-100 to-blue-50';
        }
    }, [weather]);

    return (
        <div className={`w-full h-screen relative overflow-hidden bg-gradient-to-b ${skyGradient} transition-colors duration-1000`}>
            {/* Back Button */}
            <Link href="/admin/timeline" className="absolute top-6 left-6 z-50 p-3 bg-white/40 hover:bg-white/60 rounded-full text-slate-700 backdrop-blur-md transition-all shadow-sm">
                <ArrowLeft size={24} />
            </Link>

            {/* --- Background Elements (Parallax/Perspective) --- */}
            
            {/* 1. Celestial Bodies */}
            <div className="absolute inset-0 pointer-events-none">
                {weather === 'sunny' && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute top-10 right-10"
                    >
                        <div className="relative">
                            <Sun size={80} className="text-yellow-400 fill-yellow-400 animate-[spin_60s_linear_infinite]" />
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse" />
                        </div>
                    </motion.div>
                )}
                
                {weather === 'night' && (
                    <>
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-16 right-16"
                        >
                             <div className="relative">
                                <Moon size={60} className="text-yellow-100 fill-yellow-100/50" />
                                <div className="absolute inset-0 bg-yellow-100 blur-xl opacity-20" />
                            </div>
                        </motion.div>
                        {/* Stars */}
                        {mounted && Array.from({ length: 50 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white rounded-full"
                                style={{
                                    top: `${Math.random() * 60}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: Math.random() * 3 + 1,
                                    height: Math.random() * 3 + 1,
                                }}
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* 2. Clouds (For Sunny/Rainy) */}
            {(weather === 'sunny' || weather === 'rainy') && (
                <div className="absolute inset-0 pointer-events-none">
                     <motion.div 
                        className="absolute top-20 left-10 opacity-60 text-white"
                        animate={{ x: [0, 50, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     >
                        <Cloud size={120} className={weather === 'rainy' ? 'text-slate-500 fill-slate-500' : 'text-white fill-white'} />
                     </motion.div>
                     <motion.div 
                        className="absolute top-40 right-20 opacity-40"
                        animate={{ x: [0, -30, 0] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                     >
                        <Cloud size={80} className={weather === 'rainy' ? 'text-slate-600 fill-slate-600' : 'text-white fill-white'} />
                     </motion.div>
                </div>
            )}

            {/* 3. Distant Mountains/Hills (Parallax Layer) */}
            <div className="absolute bottom-0 w-full h-1/2 pointer-events-none flex items-end opacity-50">
                 <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" style={{ transform: 'scale(1.5) translateY(20%)' }}>
                    <path fill={weather === 'night' ? '#1e1b4b' : '#cce3de'} fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* 4. Ground Plane (3D Perspective) */}
            <div 
                className="absolute bottom-0 w-full h-[40vh] origin-bottom"
                style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                }}
            >
                <div 
                    className={`w-full h-full absolute bottom-0 ${weather === 'night' ? 'bg-[#0f172a]' : 'bg-[#e2e8f0]'}`}
                    style={{
                        transform: 'rotateX(60deg) scale(2)',
                        background: weather === 'night' 
                            ? 'linear-gradient(to top, #020617 0%, #1e293b 100%)' 
                            : 'linear-gradient(to top, #86efac 0%, #dcfce7 100%)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.2)'
                    }}
                />
            </div>

            {/* --- Main Scene --- */}
            
            {/* The Tree Container */}
            <div className="absolute bottom-20 md:bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[70vh] md:h-[80vh] flex items-end justify-center pointer-events-none z-10">
                <LoveTree daysTogether={stats.days} memoryCount={stats.memories} />
            </div>

            {/* --- Foreground Weather Effects --- */}
            
            {/* Rain */}
            {weather === 'rainy' && mounted && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-slate-400 w-[1px] h-4 opacity-60"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: -20,
                            }}
                            animate={{ 
                                y: ['0vh', '100vh'],
                                opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                                duration: 0.5 + Math.random() * 0.5, 
                                repeat: Infinity, 
                                ease: "linear",
                                delay: Math.random() * 2 
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Fog */}
            {weather === 'foggy' && (
                <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none z-20">
                     <motion.div 
                        className="absolute bottom-0 w-[200%] h-full bg-gradient-to-t from-white/80 via-white/40 to-transparent"
                        animate={{ x: ['-50%', '0%'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     />
                </div>
            )}
            
            {/* Night Flies / Fireflies */}
            {weather === 'night' && mounted && (
                 <div className="absolute inset-0 pointer-events-none z-20">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                            key={`fly-${i}`}
                            className="absolute w-1 h-1 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow]"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${50 + Math.random() * 50}%`,
                            }}
                            animate={{ 
                                x: [0, Math.random() * 50 - 25, 0],
                                y: [0, Math.random() * -50, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ 
                                duration: 4 + Math.random() * 4, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                delay: Math.random() * 5 
                            }}
                        />
                    ))}
                 </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-8 right-8 z-30 text-right">
                <div className={`text-xs font-medium uppercase tracking-widest mb-1 ${weather === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {weather === 'sunny' && '美好的一天'}
                    {weather === 'night' && '星空之夜'}
                    {weather === 'rainy' && '绵绵细雨'}
                    {weather === 'foggy' && '雾蒙蒙的早晨'}
                </div>
                <div className={`text-sm font-bold ${weather === 'night' ? 'text-white' : 'text-slate-800'}`}>
                    {stats.days} 爱意生长天数
                </div>
            </div>
        </div>
    );
}
