'use client';

import { useState } from 'react';
import { MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { deleteMemory } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import EditMemoryForm from './EditMemoryForm';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function MemoryActions({ memory }: { memory: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleConfirmDelete = async () => {
      setIsDeleting(true);
      const res = await deleteMemory(memory.id);
      if (res.success) {
        router.push('/admin/timeline');
      } else {
        alert('删除失败');
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <MoreVertical size={20} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden"
              >
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 size={16} /> 编辑回忆
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setShowDeleteDialog(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} /> 删除回忆
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="删除回忆？"
        message="确定要删除这条回忆吗？此操作无法撤销。"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
      />

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10 max-h-[80vh] flex flex-col my-auto"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">编辑回忆</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-full">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6">
                <EditMemoryForm memory={memory} onSuccess={() => setIsEditing(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
