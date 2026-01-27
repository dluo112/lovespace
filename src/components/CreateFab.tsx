'use client';

import { useState, useActionState, useEffect, useTransition } from 'react';
import { Plus, X, Image as ImageIcon, MapPin, Globe, Lock, Loader2, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMemory } from '@/app/actions/admin';
import { reverseGeocodeAmap } from '@/app/actions/location';

const initialState = {
  success: false,
  error: '',
  timestamp: 0,
};

export default function CreateFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createMemory, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = useState(false);
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (state.success && state.timestamp) {
      setIsOpen(false);
      setFiles([]);
      setPreviews([]);
      setLocation(''); 
      setIsPublic(false); 
    }
  }, [state.timestamp, state.success]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let loc = '无法获取位置';

        // Strategy 1: AMap (Gaode) - High precision, Domestic
        try {
          const amapRes = await reverseGeocodeAmap(latitude, longitude);
          if (amapRes.success && amapRes.address) {
            setLocation(amapRes.address);
            setGettingLocation(false);
            return;
          }
          console.warn('AMap failed/missing key', amapRes.error);
        } catch (e) {
          console.warn('AMap action failed', e);
        }

        // All location services failed (or fallback disabled)
        setLocation(loc);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles);
    setFiles(prev => [...prev, ...newFiles]);

    // Generate previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the old URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    // Capture form element immediately to avoid losing context in async/await
    const formElement = e.currentTarget as unknown as HTMLFormElement;

    try {
      const imageUrls: string[] = [];
      
      // Upload files
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            imageUrls.push(data.url);
          }
        } catch (err) {
          console.error('Upload failed for file', file.name, err);
        }
      }

      // Construct form data for server action
      const formData = new FormData();
      // Copy existing form fields
      const currentForm = new FormData(formElement);
      
      currentForm.forEach((value, key) => {
        formData.append(key, value);
      });
      
      // Add images
      formData.set('images', JSON.stringify(imageUrls));
      
      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      console.error('Submit error', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand-pink text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:shadow-brand-pink/40 hover:shadow-2xl transition-all"
      >
        <Plus size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="fixed inset-x-4 bottom-24 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-[70] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-slate-800">新的记忆</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Images hidden input not needed as we inject it manually, but kept for reference if needed */}
                
                <div className="relative">
                  <textarea
                    name="content"
                    placeholder="此刻你在想什么？"
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all text-slate-700"
                    required
                  />
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {previews.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden group">
                        <img src={img} alt="预览" className="w-full h-full object-cover" />
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

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <label className={`flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ImageIcon size={16} />
                    添加照片
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <div className="flex-1" />
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl relative">
                    <MapPin size={18} className="text-slate-400" />
                    <input 
                      type="text" 
                      name="location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="添加位置..." 
                      className="bg-transparent w-full focus:outline-none text-sm text-slate-600 placeholder:text-slate-400 pr-8"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="absolute right-3 text-slate-400 hover:text-brand-pink transition-colors"
                    >
                      {gettingLocation ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <LocateFixed size={16} />
                      )}
                    </button>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isPublic" 
                        className="peer sr-only" 
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-checked:bg-brand-pink rounded-full transition-colors relative">
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isPublic ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Globe size={14} /> 对访客公开
                      </span>
                      <span className="text-xs text-slate-400">
                        所有能访问空间的人

                      </span>
                    </div>
                  </label>
                </div>

                {state?.error && (
                  <p className="text-red-500 text-sm text-center">{state.error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending || isTransitionPending || isUploading}
                  className="w-full bg-slate-800 text-white py-4 rounded-xl font-medium tracking-wide shadow-lg hover:shadow-xl hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPending || isTransitionPending || isUploading ? '发布中...' : '发布'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
