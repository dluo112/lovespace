'use client';

import { useState, useActionState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import FloatingHearts from '@/components/FloatingHearts';
import { login } from '@/app/actions/auth';
import { getPublicProfile } from '@/app/actions/public';
import { getSystemSettings } from '@/app/actions/settings';

const initialState = {
  error: '',
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'boy' | 'girl' | null>(null);
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [profiles, setProfiles] = useState({
    boy: {
      avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
      name: "他"
    },
    girl: {
      avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Eliza&backgroundColor=ffdfbf",
      name: "她"
    }
  });
  const [enableGuest, setEnableGuest] = useState(true);

  useEffect(() => {
    async function init() {
      const data = await getPublicProfile();
      setProfiles(data);
      
      const settings = await getSystemSettings();
      if (settings.success && settings.data) {
        setEnableGuest(settings.data.enableGuestAccess);
      }
    }
    init();
  }, []);

  // 当点击背景时关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedRole(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FFFAF0] flex flex-col items-center justify-center font-serif">
      {/* 背景动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 z-0"></div>
      
      <FloatingHearts />

      {/* 主标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 mb-20 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-light text-slate-800 tracking-widest italic">
          LoveSpace
        </h1>
        <p className="text-slate-400 mt-4 text-sm tracking-[0.3em] uppercase">
          回忆绽放的地方
        </p>
      </motion.div>

      {/* 核心交互区域 */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {/* 状态 1: 未选择角色 - 显示两个头像 */}
          {!selectedRole && (
            <motion.div 
              key="avatar-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-12 md:gap-24 items-center absolute"
            >
              {/* Boy Avatar */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole('boy')}
                className="group relative flex flex-col items-center gap-6"
              >
                <motion.div 
                  layoutId="avatar-boy"
                  className="relative w-36 h-36 md:w-48 md:h-48 rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden border-4 border-white/80 bg-white"
                >
                  <Image 
                    src={profiles.boy.avatar}
                    alt="Him"
                    fill
                    suppressHydrationWarning
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </motion.div>
                <motion.span 
                  layoutId="label-boy"
                  className="text-slate-500 font-medium text-lg tracking-widest group-hover:text-slate-800 transition-colors border-b border-transparent group-hover:border-slate-300 pb-1"
                >
                  {profiles.boy.name}
                </motion.span>
              </motion.button>

              {/* Girl Avatar */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRole('girl')}
                className="group relative flex flex-col items-center gap-6"
              >
                <motion.div 
                  layoutId="avatar-girl"
                  className="relative w-36 h-36 md:w-48 md:h-48 rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden border-4 border-white/80 bg-white"
                >
                  <Image 
                    src={profiles.girl.avatar}
                    alt="Her"
                    fill
                    suppressHydrationWarning
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </motion.div>
                <motion.span 
                  layoutId="label-girl"
                  className="text-slate-500 font-medium text-lg tracking-widest group-hover:text-slate-800 transition-colors border-b border-transparent group-hover:border-slate-300 pb-1"
                >
                  {profiles.girl.name}
                </motion.span>
              </motion.button>
            </motion.div>
          )}

          {/* 状态 2: 已选择角色 - 显示单个大头像和表单 */}
          {selectedRole && (
             <motion.div
               key="login-form"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center w-full"
             >
               {/* 选中的头像 - 移动到中心并放大 */}
               <motion.div 
                  layoutId={`avatar-${selectedRole}`}
                  className="relative w-48 h-48 md:w-56 md:h-56 rounded-full shadow-2xl border-4 border-white bg-white overflow-hidden z-20 mb-8"
                >
                  <Image 
                    src={selectedRole === 'boy' 
                      ? profiles.boy.avatar
                      : profiles.girl.avatar
                    }
                    alt={selectedRole === 'boy' ? "Him" : "Her"}
                    fill
                    suppressHydrationWarning
                    className="object-cover"
                  />
                </motion.div>
                
                {/* 登录卡片 */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white/40 backdrop-blur-md border border-white/40 p-8 md:p-10 rounded-[2rem] shadow-xl w-full relative"
                >
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 p-2 rounded-full hover:bg-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center mb-6">
                    <motion.h2 
                      layoutId={`label-${selectedRole}`}
                      className="text-2xl font-light text-slate-800 mb-1 italic tracking-widest"
                    >
                      {selectedRole === 'boy' ? profiles.boy.name : profiles.girl.name}
                    </motion.h2>
                    <p className="text-slate-500 text-xs tracking-widest uppercase">
                      输入密钥
                    </p>
                  </div>

                  <form action={formAction} className="flex flex-col gap-4">
                    <input type="hidden" name="role" value={selectedRole} />
                    
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full px-6 py-4 rounded-xl bg-white/60 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all text-center text-slate-800 placeholder:text-slate-300 tracking-[0.5em] text-lg shadow-inner"
                      autoFocus
                    />

                    {state?.error && (
                      <p className="text-rose-400 text-xs text-center tracking-wide">
                        {state.error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="mt-2 w-full bg-slate-800 text-white py-4 rounded-xl font-medium tracking-widest text-sm hover:bg-slate-900 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                      {isPending ? '解锁中...' : '解锁'}
                    </button>
                  </form>
                </motion.div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 访客入口 */}
      <AnimatePresence>
      {enableGuest && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            className="fixed bottom-10 z-10"
        >
            <Link
            href="/guest/timeline"
            className="text-slate-300 hover:text-slate-500 text-xs flex items-center gap-2 transition-colors tracking-widest uppercase hover:underline underline-offset-4"
            >
            访客入口 <ArrowRight className="w-3 h-3" />
            </Link>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
