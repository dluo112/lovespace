'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getSystemSettings } from '@/app/actions/settings';

export default function DaysCounter() {
  const [days, setDays] = useState(0);
  const [startDate, setStartDate] = useState(new Date('2023-01-01'));

  useEffect(() => {
    async function init() {
      const { data } = await getSystemSettings();
      if (data?.startDate) {
        setStartDate(new Date(data.startDate));
      }
    }
    init();
  }, []);

  useEffect(() => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDays(diffDays);
  }, [startDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-40 flex flex-col items-center justify-center overflow-hidden mb-2 rounded-xl shadow-sm mx-auto bg-gradient-to-br from-[#FFB6C1] via-purple-300 to-blue-200"
    >
      {/* Background Breathing Animation - Simplified */}
      <motion.div
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-white/10 z-0"
      />
      
      <div className="z-10 text-white text-center">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase opacity-90 mb-1">
          我们已经相爱了
        </h2>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold font-serif">
            {days}
          </span>
          <span className="text-base font-medium opacity-90">
            天
          </span>
        </div>
        <p className="text-[10px] mt-2 opacity-80 tracking-widest uppercase" suppressHydrationWarning>
          始于 {startDate.toLocaleDateString('zh-CN')}
        </p>
      </div>
    </motion.div>
  );
}
