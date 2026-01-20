'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Calendar, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/timeline', label: '时光', icon: Clock },
    { href: '/admin/anniversary', label: '纪念日', icon: Calendar },
    { href: '/admin/capsule', label: '胶囊', icon: Lock },
    { href: '/admin/profile', label: '我的', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100 pb-safe pt-2 z-50">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full text-slate-400"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute top-0 w-12 h-1 bg-brand-pink rounded-b-full shadow-[0_4px_12px_rgba(255,182,193,0.5)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`transition-colors duration-300 ${isActive ? 'text-brand-pink' : 'text-slate-400'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-wide ${isActive ? 'text-brand-pink' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
