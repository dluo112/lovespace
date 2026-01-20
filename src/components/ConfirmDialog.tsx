'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = '删除', 
  cancelText = '取消', 
  onConfirm, 
  onCancel, 
  isLoading = false,
  variant = 'danger'
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={isLoading ? undefined : onCancel}
          />
          
          {/* Dialog */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  variant === 'danger' ? 'bg-red-50 text-red-500' : 
                  variant === 'warning' ? 'bg-amber-50 text-amber-500' : 
                  'bg-blue-50 text-blue-500'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg leading-tight">{title}</h3>
                </div>
              </div>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {message}
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 ${
                    variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
                    variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        处理中...
                    </>
                  ) : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
