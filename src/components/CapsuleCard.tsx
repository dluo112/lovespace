'use client';

import { useState } from 'react';
import { Lock, Unlock, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CapsuleProps {
  capsule: {
    id: string;
    content: string;
    unlockDate: Date;
    isOpened: boolean;
    userId: string;
    type: string;
    user?: {
      name: string | null;
      avatar: string | null;
    };
  };
  currentUserId?: string;
}

export default function CapsuleCard({ capsule, currentUserId }: CapsuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const now = new Date();
  const unlockDate = new Date(capsule.unlockDate);
  const isLocked = unlockDate > now;
  
  const diffTime = unlockDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Determine if it's a "Received" capsule or "Sent" capsule
  // Received = created by someone else
  const isReceived = capsule.userId !== currentUserId;
  
  // Colors based on type
  // Sent (Self): Sky Blue theme
  // Sent (Partner): Purple/Pink theme (Original Style)
  // Received (Partner): Purple/Pink theme
  
  const isPartnerBound = !isReceived && capsule.type === 'PARTNER';

  const themeClass = (isReceived || isPartnerBound)
    ? 'from-purple-50 to-pink-50 border-purple-100 text-purple-400' 
    : 'from-sky-50 to-blue-50 border-sky-100 text-sky-400';
    
  const iconBgClass = (isReceived || isPartnerBound)
    ? 'text-purple-400 group-hover:text-purple-500'
    : 'text-sky-400 group-hover:text-sky-500';

  const badgeClass = (isReceived || isPartnerBound)
    ? 'bg-purple-100 text-purple-600'
    : 'bg-sky-100 text-sky-600';

  if (isLocked) {
    return (
      <div className={`rounded-xl p-4 border flex flex-col items-center justify-center gap-3 aspect-[4/5] relative overflow-hidden group ${isReceived ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
        <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Lock size={24} className="mb-1 relative z-10" />
        <div className="text-center relative z-10">
          <p className="text-xs font-medium tracking-widest uppercase">未解锁</p>
          <p className="text-[10px] mt-1 font-mono bg-slate-200/50 px-2 py-0.5 rounded-md" suppressHydrationWarning>
            还有 {daysLeft} 天
          </p>
          
          {/* Ownership Badge */}
          <div className="mt-2">
            {isReceived ? (
                <span className="text-[9px] bg-purple-100 text-purple-400 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    来自 {capsule.user?.name || 'Partner'}
                </span>
            ) : isPartnerBound ? (
                <span className="text-[9px] bg-purple-100 text-purple-400 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    给对方
                </span>
            ) : (
                <span className="text-[9px] bg-sky-100 text-sky-400 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    我的胶囊
                </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 text-[10px] opacity-60" suppressHydrationWarning>
            {unlockDate.toLocaleDateString()}
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        layoutId={`capsule-${capsule.id}`}
        onClick={() => setIsExpanded(true)}
        className={`bg-gradient-to-br rounded-xl p-4 border cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 aspect-[4/5] relative group ${themeClass}`}
      >
        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${iconBgClass}`}>
            <Unlock size={18} />
        </div>
        <div className="text-center">
            <p className="text-xs font-medium text-slate-700 tracking-widest uppercase">已解锁</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">点击阅读</p>
            
            {/* Ownership Badge */}
            <div className="mt-2">
                {isReceived ? (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${badgeClass}`}>
                        来自 {capsule.user?.name || 'Partner'}
                    </span>
                ) : isPartnerBound ? (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${badgeClass}`}>
                        给对方
                    </span>
                ) : (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${badgeClass}`}>
                        我的胶囊
                    </span>
                )}
            </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              layoutId={`capsule-${capsule.id}`}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 md:w-full md:max-w-lg md:left-1/2 md:-translate-x-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 overflow-hidden min-h-[300px] flex flex-col"
            >
                <div className={`flex items-center gap-2 mb-4 text-xs font-medium tracking-widest uppercase ${isReceived ? 'text-purple-400' : 'text-sky-400'}`}>
                    <Clock size={14} />
                    {isReceived ? `来自 ${capsule.user?.name || 'Partner'}` : '来自过去'}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <p className="text-slate-700 leading-relaxed font-serif text-base">
                        {capsule.content}
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="text-slate-400 text-[10px] tracking-widest uppercase hover:text-slate-600 transition-colors"
                    >
                        关闭
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
