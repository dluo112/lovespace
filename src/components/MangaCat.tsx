'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface MangaCatProps {
  role?: 'ADMIN' | 'GUEST';
  partnerMood?: string;
}

const MESSAGES = [
  "又是想你的一天~",
  "摸摸头，辛苦啦！",
  "今天也要记得开心哦！",
  "喵呜~ 蹭蹭你！",
  "要抱抱~",
  "你是最棒的！"
];

const GUEST_MESSAGES = [
  "欢迎来到这个充满爱的空间喵~",
  "随便逛逛哦~",
  "这里记录着满满的回忆呢！",
  "即使是访客也要开心哦！"
];

// Anime Style Cat SVG
const AnimeCatSVG = ({ isSleeping, isHappy }: { isSleeping: boolean, isHappy: boolean }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isSleeping) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, [isSleeping]);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
      <defs>
        <linearGradient id="bodyGradient" x1="60" y1="20" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F3F4F6" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Tail - Fluffy and Animated */}
      <motion.path
        d="M90 90 C 110 90, 115 60, 100 50 C 95 45, 105 40, 110 45"
        stroke="#F3F4F6"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        initial={{ rotate: 0, originX: 0.8, originY: 0.8 }}
        animate={isSleeping ? {} : { 
           rotate: [0, 8, 0, -5, 0],
           d: [
             "M85 95 C 105 95, 110 65, 95 55",
             "M85 95 C 100 95, 105 75, 90 65", 
             "M85 95 C 105 95, 110 65, 95 55"
           ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Body - Soft Shape */}
      <motion.ellipse 
        cx="60" cy="80" rx="45" ry="35" 
        fill="url(#bodyGradient)"
        animate={{ ry: [35, 36, 35] }} // Breathing
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Body Shadow (Bottom) */}
      <ellipse cx="60" cy="105" rx="30" ry="5" fill="#000" opacity="0.1" />

      {/* Head Group */}
      <motion.g
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Head Base */}
        <circle cx="60" cy="50" r="35" fill="#FFFFFF" />
        
        {/* Ears */}
        <path d="M35 30 L25 5 L50 20 Z" fill="#FFFFFF" stroke="#F3F4F6" strokeWidth="1" strokeLinejoin="round" />
        <path d="M85 30 L95 5 L70 20 Z" fill="#FFFFFF" stroke="#F3F4F6" strokeWidth="1" strokeLinejoin="round" />
        
        {/* Inner Ears (Soft Pink) */}
        <path d="M38 28 L32 12 L45 22 Z" fill="#FECDD3" />
        <path d="M82 28 L88 12 L75 22 Z" fill="#FECDD3" />

        {/* Face Details */}
        {isSleeping ? (
          <g>
             {/* Sleeping Eyes */}
            <path d="M40 50 Q 45 53, 50 50" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M70 50 Q 75 53, 80 50" stroke="#4B5563" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            
            {/* Zzz Bubble */}
             <motion.g
                animate={{ opacity: [0, 1, 0], y: -15, x: 10 }}
                transition={{ duration: 2.5, repeat: Infinity }}
             >
                <text x="85" y="30" fontSize="16" fill="#818CF8" fontWeight="bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>Zzz</text>
             </motion.g>
          </g>
        ) : (
          <g>
            {/* Anime Eyes */}
            {isHappy ? (
                // Happy Eyes (Curved Lines)
                <>
                    <path d="M40 48 Q 48 40, 56 48" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M64 48 Q 72 40, 80 48" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
            ) : (
                // Big Anime Eyes
                <>
                    {/* Left Eye */}
                    <ellipse cx="48" cy="48" rx={isBlinking ? 6 : 6} ry={isBlinking ? 0.5 : 7} fill="#1F2937" />
                    {!isBlinking && (
                        <>
                            <circle cx="45" cy="45" r="2.5" fill="white" /> {/* Big Highlight */}
                            <circle cx="50" cy="50" r="1.5" fill="white" opacity="0.7" /> {/* Small Highlight */}
                        </>
                    )}

                    {/* Right Eye */}
                    <ellipse cx="72" cy="48" rx={isBlinking ? 6 : 6} ry={isBlinking ? 0.5 : 7} fill="#1F2937" />
                    {!isBlinking && (
                        <>
                            <circle cx="69" cy="45" r="2.5" fill="white" />
                            <circle cx="74" cy="50" r="1.5" fill="white" opacity="0.7" />
                        </>
                    )}
                </>
            )}

            {/* Nose & Mouth */}
            <path d="M58 58 L60 60 L62 58" fill="#FDA4AF" stroke="#FDA4AF" strokeWidth="1" />
            <path d="M60 60 Q 55 65, 50 62" stroke="#4B5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M60 60 Q 65 65, 70 62" stroke="#4B5563" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Blush */}
            <ellipse cx="38" cy="58" rx="5" ry="3" fill="#FDA4AF" opacity="0.4" />
            <ellipse cx="82" cy="58" rx="5" ry="3" fill="#FDA4AF" opacity="0.4" />
          </g>
        )}
      </motion.g>
      
      {/* Paws (Resting on edge) */}
      <ellipse cx="45" cy="105" rx="8" ry="6" fill="#FFFFFF" />
      <ellipse cx="75" cy="105" rx="8" ry="6" fill="#FFFFFF" />
      <path d="M45 102 L45 108" stroke="#E5E7EB" strokeWidth="1" />
      <path d="M75 102 L75 108" stroke="#E5E7EB" strokeWidth="1" />
    </svg>
  );
};

export default function MangaCat({ role = 'GUEST', partnerMood }: MangaCatProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isCrazy, setIsCrazy] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  
  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem('manga-cat-pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            setPosition(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved position', e);
      }
    }
  }, []);

  const constraintsRef = useRef(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check time for sleep mode (23:00 - 06:00)
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsSleeping(hour >= 23 || hour < 6);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); 
    return () => clearInterval(interval);
  }, []);

  // Reset click count if idle for 2 seconds
  useEffect(() => {
    if (clickCount > 0 && clickCount < 5) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleClick = () => {
    if (isDragging) return; // Prevent click when dragging

    if (isSleeping) {
      setMessage("呼...呼... (正在睡觉中)");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 500);

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    let msgs = role === 'GUEST' ? GUEST_MESSAGES : MESSAGES;
    if (role === 'ADMIN') msgs = [...MESSAGES, ...GUEST_MESSAGES];

    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    setMessage(randomMsg);
    
    timeoutRef.current = setTimeout(() => {
      setMessage(null);
    }, 3000);

    if (newCount >= 5) {
      triggerCrazyMode();
      setClickCount(0);
    }
  };

  const triggerCrazyMode = () => {
    setIsCrazy(true);
    setMessage("喵喵喵！！！疯狂模式！");
    
    const end = Date.now() + 1000;
    const colors = ['#ec4899', '#8b5cf6', '#f43f5e'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.9 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0.8, y: 0.9 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
    
    setTimeout(() => {
      setIsCrazy(false);
      setMessage(null);
    }, 2000);
  };

  const containerVariants = {
    idle: {
      y: [0, -3, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    jump: {
      y: -60,
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    crazy: {
      x: [0, -100, 50, -200, 20, 0],
      y: [0, -50, 0, -20, 0],
      rotate: [0, -20, 20, -10, 0],
      scale: [1, 1.1, 0.9, 1.05, 1],
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  return (
    <>
    <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-[50]" />
    <motion.div 
      drag
      dragConstraints={constraintsRef}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setTimeout(() => setIsDragging(false), 50); 
        
        // Calculate clamped position
        let newX = position.x + info.offset.x;
        let newY = position.y + info.offset.y;

        // Get window dimensions
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Cat size approx 120x120 + message bubble offset
        // Initial position is bottom: 16px (4), right: 32px (8)
        // x > 0 moves right (off screen), y > 0 moves down (off screen)
        // x < 0 moves left, y < 0 moves up
        
        // Hard limits relative to initial position (bottom-right)
        // Max X (right) should be close to 0 (initial position)
        // Min X (left) should be -(winW - width - padding)
        
        // Safety clamp to prevent disappearing
        // Assume approximate safe bounds
        const safeRight = 20; 
        const safeBottom = 20;
        const safeLeft = -(winW - 100);
        const safeTop = -(winH - 100);

        if (newX > safeRight) newX = safeRight;
        if (newX < safeLeft) newX = safeLeft;
        if (newY > safeBottom) newY = safeBottom;
        if (newY < safeTop) newY = safeTop;

        const newPos = { x: newX, y: newY };
        setPosition(newPos);
        localStorage.setItem('manga-cat-pos', JSON.stringify(newPos));
      }}
      animate={{ x: position.x, y: position.y }}
      ref={catRef}
      className="fixed bottom-4 right-8 z-[100] flex flex-col items-end cursor-grab active:cursor-grabbing"
    >
        {/* Message Bubble */}
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="mb-1 mr-8 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-br-none shadow-xl border border-indigo-100 text-sm font-bold text-slate-700 whitespace-nowrap relative max-w-[220px] text-center pointer-events-none"
                    style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}
                >
                    {message}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/90 border-b border-r border-indigo-100 transform rotate-45"></div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Cat Container */}
        <motion.div
            className="relative group"
            variants={containerVariants}
            animate={isCrazy ? "crazy" : isJumping ? "jump" : "idle"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`transition-all duration-500 ${isSleeping ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}`}>
               <AnimeCatSVG isSleeping={isSleeping} isHappy={isHovered && !isSleeping} />
            </div>
            
            {/* Partner Mood Indicator - Subtle Glow */}
            {partnerMood && !isSleeping && (
                <motion.div 
                    className="absolute top-2 right-4 w-2 h-2 bg-rose-400 rounded-full shadow-[0_0_8px_2px_rgba(251,113,133,0.8)] z-20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
            )}
          </motion.div>
     </motion.div>
    </>
    );
  }
