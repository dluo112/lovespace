'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoveTreeProps {
  daysTogether: number;
  memoryCount: number;
}

interface Cluster {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface Fruit {
  cx: number;
  cy: number;
  delay: number;
}

export default function LoveTree({ daysTogether, memoryCount }: LoveTreeProps) {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);

  useEffect(() => {
    // Growth logic
    let heightFactor = 0.6;
    if (daysTogether <= 100) {
        heightFactor = 0.6 + (daysTogether / 100) * 0.3;
    } else if (daysTogether <= 365) {
        heightFactor = 0.9 + ((daysTogether - 100) / 265) * 0.3;
    } else {
        heightFactor = 1.2 + Math.min(0.6, ((daysTogether - 365) / 730) * 0.6);
    }

    const density = Math.min(40, 12 + Math.floor(memoryCount / 1.5));
    
    setClusters(Array.from({ length: density }).map((_, i) => ({
      x: (Math.random() - 0.5) * 180 * heightFactor,
      y: -120 - Math.random() * 220 * heightFactor,
      size: 20 + Math.random() * 30,
      color: i % 3 === 0 ? '#4ADE80' : i % 3 === 1 ? '#22C55E' : '#16A34A', 
      delay: Math.random() * 2,
    })));

    setFruits(Array.from({ length: Math.min(10, Math.floor(memoryCount / 2)) }).map((_, i) => ({
        cx: (Math.random() - 0.5) * 100,
        cy: -150 - Math.random() * 150,
        delay: 2 + i * 0.2,
    })));

  }, [daysTogether, memoryCount]);

  return (
    <div className="relative w-full h-full flex items-end justify-center pointer-events-none">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="-200 -400 400 400" 
        preserveAspectRatio="xMidYBottom" 
        className="drop-shadow-xl"
      >
        <defs>
            <filter id="leafBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
            <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5D4037" />
                <stop offset="40%" stopColor="#795548" />
                <stop offset="100%" stopColor="#5D4037" />
            </linearGradient>
        </defs>

        <motion.g
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
            {/* Main Trunk - Robust and Natural */}
            <motion.path 
                d={`
                    M -20,0 
                    Q -15,-50 -25,-100 
                    T 0,-250 
                    T 15,-320
                    L 30,-320
                    Q 35,-150 40,-50
                    L 20,0
                    Z
                `}
                fill="url(#trunkGradient)"
                stroke="#3E2723"
                strokeWidth="1"
                animate={{ 
                    d: [
                        `M -20,0 Q -15,-50 -25,-100 T 0,-250 T 15,-320 L 30,-320 Q 35,-150 40,-50 L 20,0 Z`,
                        `M -20,0 Q -10,-50 -20,-100 T 5,-250 T 20,-320 L 35,-320 Q 40,-150 45,-50 L 20,0 Z`,
                        `M -20,0 Q -15,-50 -25,-100 T 0,-250 T 15,-320 L 30,-320 Q 35,-150 40,-50 L 20,0 Z`
                    ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Branches */}
            <path d="M -25,-100 Q -70,-160 -100,-190" stroke="#5D4037" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M 0,-200 Q 50,-250 80,-290" stroke="#5D4037" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 0,-250 Q -40,-290 -50,-330" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round" />

            {/* Leaf Clusters (Lush Greenery) */}
            {clusters.map((cluster, i) => (
                <motion.g
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + cluster.delay, duration: 1.5 }}
                >
                    <motion.circle
                        cx={cluster.x}
                        cy={cluster.y}
                        r={cluster.size}
                        fill={cluster.color}
                        // filter="url(#leafBlur)" // Optional blur for depth
                        animate={{ 
                            x: [0, 3, -3, 0], 
                            y: [0, -3, 0],
                        }}
                        transition={{ 
                            duration: 5 + Math.random() * 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: Math.random() 
                        }}
                    />
                    {/* Add some texture/shadow to leaves */}
                     <circle
                        cx={cluster.x - 5}
                        cy={cluster.y + 5}
                        r={cluster.size * 0.8}
                        fill="black"
                        opacity="0.1"
                        style={{ pointerEvents: 'none' }}
                    />
                </motion.g>
            ))}
            
            {/* Fruits (Memories) - Red Apples */}
            {fruits.map((fruit, i) => (
                <motion.circle
                    key={`fruit-${i}`}
                    r={6}
                    fill="#EF4444" // Red-500
                    cx={fruit.cx}
                    cy={fruit.cy}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: fruit.delay, type: "spring" }}
                >
                </motion.circle>
            ))}
        </motion.g>
      </svg>
    </div>
  );
}
