'use client';

import { useState, useActionState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { createComment } from '@/app/actions/admin';

const initialState = {
  success: false,
  error: '',
};

export default function CommentForm({ memoryId }: { memoryId: string }) {
  const [state, formAction, isPending] = useActionState(createComment.bind(null, memoryId), initialState);
  const [content, setContent] = useState('');
  // For admin, author is usually "Me" or the user's name, but let's allow custom or default
  // Ideally this comes from session, but for simplicity:
  const [author, setAuthor] = useState('我'); 

  useEffect(() => {
    if (state.success) {
      setContent('');
    }
  }, [state.success]);

  return (
    <form action={formAction} className="bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex items-end gap-2 sticky bottom-4 z-10">
      <input type="hidden" name="author" value={author} />
      <div className="flex-1">
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下评论..."
          rows={1}
          className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none min-h-[44px] max-h-32"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="p-3 bg-brand-pink text-white rounded-lg hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
}
