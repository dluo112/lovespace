'use client';

import { useState, useActionState, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import { createComment } from '@/app/actions/admin';

const initialState = {
  success: false,
  error: '',
};

export default function GuestCommentForm({ memoryId }: { memoryId: string }) {
  const [state, formAction, isPending] = useActionState(createComment.bind(null, memoryId), initialState);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(''); // Default to empty, let user type
  
  useEffect(() => {
    if (state.success) {
      setContent('');
      // Keep author for convenience
    }
  }, [state.success]);

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 sticky bottom-4 z-10 space-y-3">
      <form action={formAction} className="flex flex-col gap-2">
        {/* Author Input */}
        <div className="flex items-center gap-2 px-1">
           <User size={14} className="text-slate-400" />
           <input 
             type="text" 
             name="author" 
             value={author}
             onChange={(e) => setAuthor(e.target.value)}
             placeholder="你的名字 (选填)"
             className="text-xs text-slate-700 bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-400 w-full"
           />
        </div>
        
        <div className="flex items-end gap-2 border-t border-slate-50 pt-2">
          <div className="flex-1">
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下评论..."
              rows={1}
              className="w-full bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-brand-pink/20 p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none min-h-[44px] max-h-32"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="p-3 bg-brand-pink text-white rounded-lg hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}
