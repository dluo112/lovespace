'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile, Frown, Meh, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateMood, getPartnerMood } from '@/app/actions/admin';

// Mood Types
const MOODS = [
    { id: 'loving', icon: Heart, color: '#f43f5e', label: 'Loving' },
    { id: 'happy', icon: Smile, color: '#fbbf24', label: 'Happy' },
    { id: 'neutral', icon: Meh, color: '#94a3b8', label: 'Okay' },
    { id: 'sad', icon: Frown, color: '#60a5fa', label: 'Sad' },
    { id: 'energetic', icon: Zap, color: '#8b5cf6', label: 'Excited' },
];

export default function MoodWidget() {
    const [currentMood, setCurrentMood] = useState<string | null>(null);
    const [partnerMood, setPartnerMood] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string>('Partner');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial fetch
    useEffect(() => {
        fetchMood();
        // Poll every minute
        const interval = setInterval(fetchMood, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMood = async () => {
        const res = await getPartnerMood();
        if (res.success && res.data) {
            setCurrentMood(res.data.myMood || null);
            setPartnerMood(res.data.partnerMood || null);
            setPartnerName(res.data.partnerName);

            // Check for sync (fireworks) - Only trigger if both have set moods and they match
            // We store the 'last synced mood' in session storage to prevent repeated fireworks
            const syncKey = `mood-sync-${res.data.myMood}-${res.data.partnerMood}`;
            const lastSync = sessionStorage.getItem('last-mood-sync');

            if (res.data.myMood && 
                res.data.partnerMood && 
                res.data.myMood === res.data.partnerMood && 
                lastSync !== syncKey) {
                
                triggerSyncFireworks();
                sessionStorage.setItem('last-mood-sync', syncKey);
            }
        }
    };

    const triggerSyncFireworks = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            // Pink Fireworks
            confetti({
                ...defaults, 
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#f43f5e', '#fb7185', '#fda4af']
            });
            confetti({
                ...defaults, 
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#f43f5e', '#fb7185', '#fda4af']
            });
        }, 250);
    };

    const handleSelectMood = async (moodId: string) => {
        setLoading(true);
        setCurrentMood(moodId); // Optimistic update
        setIsOpen(false);
        
        const res = await updateMood(moodId);
        if (res.success) {
            fetchMood(); // Re-fetch to check sync
        }
        setLoading(false);
    };

    const activeMoodObj = MOODS.find(m => m.id === currentMood);
    const partnerMoodObj = MOODS.find(m => m.id === partnerMood);

    return (
        <div className="w-full mb-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="flex items-center justify-between">
                    {/* My Mood */}
                    <div className="flex items-center gap-3" onClick={() => setIsOpen(!isOpen)}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${activeMoodObj ? 'bg-slate-50' : 'bg-slate-100 border-2 border-dashed border-slate-300'}`}
                             style={activeMoodObj ? { backgroundColor: `${activeMoodObj.color}20`, color: activeMoodObj.color } : {}}>
                            {activeMoodObj ? <activeMoodObj.icon size={24} /> : <span className="text-xl">?</span>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">我的心情</p>
                            <p className="font-semibold text-slate-700">{activeMoodObj?.label || '今天怎么样？'}</p>
                        </div>
                    </div>

                    {/* Sync Indicator Line */}
                    <div className="flex-1 px-4 flex items-center justify-center">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${currentMood === partnerMood && currentMood ? 'bg-gradient-to-r from-pink-300 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-100'}`} />
                        {currentMood === partnerMood && currentMood && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mx-2 text-rose-500"
                            >
                                <Heart size={16} fill="currentColor" />
                            </motion.div>
                        )}
                         <div className={`h-1 flex-1 rounded-full transition-all duration-1000 ${currentMood === partnerMood && currentMood ? 'bg-gradient-to-l from-pink-300 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-100'}`} />
                    </div>

                    {/* Partner Mood */}
                    <div className="flex items-center gap-3 flex-row-reverse text-right">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${partnerMoodObj ? 'bg-slate-50' : 'bg-slate-100 border-2 border-dashed border-slate-300'}`}
                             style={partnerMoodObj ? { backgroundColor: `${partnerMoodObj.color}20`, color: partnerMoodObj.color } : {}}>
                            {partnerMoodObj ? <partnerMoodObj.icon size={24} /> : <span className="text-xl">?</span>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{partnerName}</p>
                            <p className="font-semibold text-slate-700">{partnerMoodObj?.label || '等待中...'}</p>
                        </div>
                    </div>
                </div>

                {/* Mood Selector Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-100 overflow-hidden"
                        >
                            <div className="grid grid-cols-5 gap-2">
                                {MOODS.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => handleSelectMood(mood.id)}
                                        disabled={loading}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${currentMood === mood.id ? 'bg-slate-100 ring-2 ring-slate-200' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                             style={{ backgroundColor: `${mood.color}20`, color: mood.color }}>
                                            <mood.icon size={16} />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-500">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
