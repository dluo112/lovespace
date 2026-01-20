'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// 简单的爱心 SVG
const HeartIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

interface Heart {
  id: number;
  x: number;
  scale: number;
  duration: number;
  delay: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // 生成随机爱心数据
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 百分比位置
      scale: 0.5 + Math.random() * 1, // 0.5 - 1.5 倍大小
      duration: 10 + Math.random() * 20, // 10 - 30秒漂浮时间
      delay: Math.random() * 10, // 随机延迟
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-[-50px] text-brand-pink/40"
          style={{
            left: `${heart.x}%`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: -1000, // 向上漂浮
            opacity: [0, 0.8, 0], // 淡入淡出
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'linear',
          }}
        >
          <div style={{ transform: `scale(${heart.scale})` }}>
            <HeartIcon color="currentColor" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
