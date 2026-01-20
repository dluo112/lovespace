'use client';

import { useState, useActionState, useEffect } from 'react';
import { MapPin, Globe, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { updateMemory } from '@/app/actions/admin';

const initialState = {
  success: false,
  error: '',
};

export default function EditMemoryForm({ memory, onSuccess }: { memory: any, onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(updateMemory.bind(null, memory.id), initialState);
  
  const [content, setContent] = useState(memory.content);
  const [location, setLocation] = useState(memory.location || '');
  const [isPublic, setIsPublic] = useState(memory.isPublic);
  const [images, setImages] = useState<string[]>(Array.isArray(memory.images) ? memory.images : []);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setImages(prev => [...prev, data.url]);
        }
      } catch (err) {
        console.error('Upload failed', err);
      }
    }
    
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      
      {/* Content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">内容</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all text-slate-700"
          required
        />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">图片</label>
        
        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden group">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={`flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer justify-center ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <ImageIcon size={18} />
          {isUploading ? '上传中...' : '添加更多照片'}
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">位置</label>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <MapPin size={18} className="text-slate-400" />
          <input 
            type="text" 
            name="location" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="添加位置..." 
            className="bg-transparent w-full focus:outline-none text-sm text-slate-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Visibility */}
      <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
        <div className="relative">
          <input 
            type="checkbox" 
            name="isPublic" 
            className="peer sr-only" 
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <div className={`w-10 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-brand-pink' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isPublic ? 'translate-x-4' : ''}`} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
            <Globe size={14} /> 对访客公开
          </span>
        </div>
      </label>

      {state?.error && (
        <p className="text-red-500 text-sm text-center">{state.error}</p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isPending ? '保存中...' : '保存更改'}
        </button>
      </div>
    </form>
  );
}
