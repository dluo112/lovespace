'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, LogOut, Camera, ChevronRight, Trash2, Plus, Calendar, X, Lock, Unlock, Hourglass, Mail, Mic, Image as ImageIcon, Gift, Sparkles } from 'lucide-react';
import { getUserProfile, updateProfile, getSystemSettings, updateSystemSettings } from '@/app/actions/settings';
import { getAnniversaries, createAnniversary, deleteAnniversary, getCapsules, createCapsule, deleteCapsule } from '@/app/actions/admin';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'anniversary' | 'capsule' | null;
    id: string | null;
    title?: string;
  }>({ isOpen: false, type: null, id: null });

  // Form State
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [enableGuestAccess, setEnableGuestAccess] = useState(true);
  
  // Anniversary State
  const [anniversaries, setAnniversaries] = useState<any[]>([]);
  const [newAnnivTitle, setNewAnnivTitle] = useState('');
  const [newAnnivDate, setNewAnnivDate] = useState('');
  const [addingAnniv, setAddingAnniv] = useState(false);
  const [showAnniversaries, setShowAnniversaries] = useState(false);
  
  // Capsule State
  const [capsules, setCapsules] = useState<any[]>([]);
  const [showCapsules, setShowCapsules] = useState(false);
  const [newCapsuleContent, setNewCapsuleContent] = useState('');
  const [newCapsuleDate, setNewCapsuleDate] = useState('');
  const [newCapsuleImages, setNewCapsuleImages] = useState<string[]>([]);
  const [newCapsuleAudio, setNewCapsuleAudio] = useState('');
  const [newCapsuleType, setNewCapsuleType] = useState<'SELF' | 'PARTNER'>('SELF');
  const [activeCapsuleTab, setActiveCapsuleTab] = useState<'sent' | 'received'>('sent');
  const [addingCapsule, setAddingCapsule] = useState(false);
  const [viewingCapsule, setViewingCapsule] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Ritual States
  const [sealing, setSealing] = useState(false);
  const [openingState, setOpeningState] = useState<'locked' | 'gift' | 'open'>('locked');
  const [openingCapsule, setOpeningCapsule] = useState<any>(null);

  const [initialName, setInitialName] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [profileRes, settingsRes, annivRes, capsuleRes] = await Promise.all([
        getUserProfile(),
        getSystemSettings(),
        getAnniversaries(),
        getCapsules()
      ]);
      
      if (profileRes.success && profileRes.data) {
        setAvatar(profileRes.data.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix");
        setName(profileRes.data.name || '');
        setInitialName(profileRes.data.name || '');
        if (profileRes.data.id) setCurrentUserId(profileRes.data.id);
      }
      
      if (settingsRes.success && settingsRes.data) {
        if (settingsRes.data.startDate) {
          setStartDate(new Date(settingsRes.data.startDate).toISOString().split('T')[0]);
        }
        setEnableGuestAccess(settingsRes.data.enableGuestAccess ?? true);
      }

      if (annivRes.success && annivRes.data) {
        setAnniversaries(annivRes.data);
      }

      if (capsuleRes.success && capsuleRes.data) {
        setCapsules(capsuleRes.data);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setAvatar(data.url);
        // Auto-save avatar change
        const profileForm = new FormData();
        profileForm.append('avatar', data.url);
        await updateProfile(profileForm);
        showToast('头像已更新');
      } else {
        showToast('上传失败');
      }
    } catch (err) {
      console.error(err);
      showToast('上传出错');
    } finally {
      setUploading(false);
    }
  };

  const handleAddAnniversary = async () => {
    if (!newAnnivTitle || !newAnnivDate) {
      showToast('请填写标题和日期');
      return;
    }
    
    setAddingAnniv(true);
    const formData = new FormData();
    formData.append('title', newAnnivTitle);
    formData.append('date', newAnnivDate);
    
    try {
      const res = await createAnniversary(formData);
      if (res.success) {
        showToast('纪念日已添加');
        setNewAnnivTitle('');
        setNewAnnivDate('');
        // Refresh list
        const { data } = await getAnniversaries();
        if (data) setAnniversaries(data);
        setShowAnniversaries(false);
      } else {
        showToast('添加失败');
      }
    } catch (e) {
      showToast('添加纪念日出错');
    } finally {
      setAddingAnniv(false);
    }
  };

  const handleDeleteAnniversary = (id: string) => {
    setDeleteConfirm({
        isOpen: true,
        type: 'anniversary',
        id,
        title: '删除纪念日？'
    });
  };

  const handleCapsuleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setNewCapsuleImages(prev => [...prev, data.url]);
      } else {
        showToast('上传失败');
      }
    } catch (err) {
      console.error(err);
      showToast('上传出错');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCapsule = async () => {
    if (!newCapsuleContent || !newCapsuleDate) {
      showToast('请填写内容和解锁日期');
      return;
    }
    
    // Ritual: Sealing Animation
    setSealing(true);
    setAddingCapsule(true);

    // Wait for animation (2s)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const formData = new FormData();
    formData.append('content', newCapsuleContent);
    formData.append('unlockDate', newCapsuleDate);
    formData.append('type', newCapsuleType);
    if (newCapsuleImages.length > 0) {
        formData.append('images', JSON.stringify(newCapsuleImages));
    }
    
    try {
      const res = await createCapsule(formData);
      if (res.success) {
        showToast('时间胶囊已埋入时间线');
        setNewCapsuleContent('');
        setNewCapsuleDate('');
        setNewCapsuleImages([]);
        setNewCapsuleType('SELF');
        // Refresh list
        const { data } = await getCapsules();
        if (data) setCapsules(data);
        setShowCapsules(false);
      } else {
        showToast('埋藏胶囊失败');
      }
    } catch (e) {
      showToast('创建胶囊出错');
    } finally {
      setAddingCapsule(false);
      setSealing(false);
    }
  };

  const handleDeleteCapsule = (id: string) => {
    setDeleteConfirm({
        isOpen: true,
        type: 'capsule',
        id,
        title: '删除胶囊？'
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id || !deleteConfirm.type) return;
    
    try {
        if (deleteConfirm.type === 'anniversary') {
            const res = await deleteAnniversary(deleteConfirm.id);
            if (res.success) {
                showToast('纪念日已删除');
                setAnniversaries(prev => prev.filter(a => a.id !== deleteConfirm.id));
            } else {
                showToast('删除失败');
            }
        } else if (deleteConfirm.type === 'capsule') {
            const res = await deleteCapsule(deleteConfirm.id);
            if (res.success) {
                showToast('胶囊已删除');
                setCapsules(prev => prev.filter(c => c.id !== deleteConfirm.id));
            } else {
                showToast('删除失败');
            }
        }
    } catch (e) {
        showToast('删除出错');
    } finally {
        setDeleteConfirm({ isOpen: false, type: null, id: null });
    }
  };

  const handleSaveAccount = async () => {
    if (name === initialName && !password) return;
    
    setSaving(true);
    try {
      const profileForm = new FormData();
      profileForm.append('name', name);
      if (password) profileForm.append('password', password);
      
      const profileRes = await updateProfile(profileForm);
      
      if (profileRes.success) {
        showToast('账户已更新');
        setInitialName(name);
        setPassword('');
        
        // If password was changed, logout
        if (password) {
            setTimeout(async () => {
              await logout();
            }, 1000);
        }
      } else {
        showToast('更新账户失败');
      }
    } catch (error) {
      console.error(error);
      showToast('保存账户出错');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    // Only save App Config settings
    try {
      const settingsForm = new FormData();
      if (startDate) settingsForm.append('startDate', startDate);
      if (enableGuestAccess) settingsForm.append('enableGuestAccess', 'on');
      
      const settingsRes = await updateSystemSettings(settingsForm);

      if (settingsRes.success) {
        // showToast('Settings saved'); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* iOS-style Header */}
      <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-slate-200/50">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">设置</h1>
      </header>

      {/* Toast Notification */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800/90 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium backdrop-blur-sm"
        >
          {message}
        </motion.div>
      )}

      <main className="px-4 py-6 max-w-md mx-auto space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
            <label className="relative group cursor-pointer">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                />
                <div className="relative w-28 h-28 rounded-full shadow-lg overflow-hidden bg-white ring-4 ring-white">
                    <img 
                        src={avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 transition-colors">
                    <Camera size={16} />
                </div>
            </label>
        
        {/* Capsule Modal */}
        <AnimatePresence>
        {showCapsules && (
            <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0" 
                    onClick={() => !sealing && setShowCapsules(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col relative z-10"
                >
                    {sealing ? (
                        <div className="flex flex-col items-center justify-center h-[400px] bg-indigo-500 text-white space-y-6">
                             <motion.div 
                                initial={{ scale: 1, rotate: 0 }}
                                animate={{ scale: [1, 1.2, 0], rotate: [0, 10, -10, 0], opacity: [1, 1, 0] }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                             >
                                <Mail size={64} />
                             </motion.div>
                             <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="font-medium text-lg tracking-wide"
                             >
                                正在密封时间胶囊...
                             </motion.p>
                        </div>
                    ) : (
                        <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Hourglass size={18} className="text-indigo-500" />
                                时间胶囊
                            </h3>
                            <button 
                                onClick={() => setShowCapsules(false)} 
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-4 space-y-6">
                            {/* State A: The Planting */}
                            <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 relative overflow-hidden transition-all duration-500">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Hourglass size={80} className="text-indigo-500" />
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                        <Plus size={14} />
                                        种下一段回忆
                                    </h4>
                                    
                                    {/* Recipient Toggle */}
                                    <div className="flex bg-white/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setNewCapsuleType('SELF')}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${newCapsuleType === 'SELF' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            给自己
                                        </button>
                                        <button
                                            onClick={() => setNewCapsuleType('PARTNER')}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${newCapsuleType === 'PARTNER' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            给对方
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 relative z-10">
                                    <textarea 
                                        value={newCapsuleContent}
                                        onChange={(e) => setNewCapsuleContent(e.target.value)}
                                        className="w-full text-sm px-4 py-3 rounded-xl border-0 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder:text-slate-400 resize-none h-24"
                                        placeholder={newCapsuleType === 'SELF' ? "写给未来的自己..." : "给对方写个惊喜..."}
                                    />
                                    
                                    {/* Images Preview */}
                                    {newCapsuleImages.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {newCapsuleImages.map((img, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 items-center">
                                        <label className="p-2.5 rounded-xl bg-white text-slate-500 ring-1 ring-slate-200 hover:text-indigo-500 cursor-pointer transition-colors shadow-sm">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleCapsuleImageUpload} disabled={uploading} />
                                            {uploading ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={20} />}
                                        </label>
                                        
                                        <input 
                                            type="date"
                                            value={newCapsuleDate}
                                            onChange={(e) => setNewCapsuleDate(e.target.value)}
                                            className="flex-1 text-sm px-4 py-2.5 rounded-xl border-0 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                                        />
                                        
                                        <button 
                                            onClick={handleAddCapsule}
                                            disabled={addingCapsule}
                                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                                        >
                                            埋藏
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">时间轴</h4>
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                        <button 
                                            onClick={() => setActiveCapsuleTab('sent')}
                                            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${activeCapsuleTab === 'sent' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            我的胶囊
                                        </button>
                                        <button 
                                            onClick={() => setActiveCapsuleTab('received')}
                                            className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${activeCapsuleTab === 'received' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            收到的
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {capsules.length > 0 ? (
                                        capsules
                                        .filter(c => {
                                            if (activeCapsuleTab === 'sent') {
                                                // Show capsules created by me (SELF or PARTNER)
                                                return c.userId === currentUserId;
                                            } else {
                                                // Show capsules created by partner (where I am recipient, implied by backend filtering)
                                                return c.userId !== currentUserId;
                                            }
                                        })
                                        .map((capsule) => {
                                            const unlockDate = new Date(capsule.unlockDate);
                                            const now = new Date();
                                            const isLocked = unlockDate > now;
                                            const daysLeft = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                            const isReceived = capsule.userId !== currentUserId;

                                            return (
                                                <motion.div 
                                                    key={capsule.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`relative p-4 rounded-2xl border transition-all ${isLocked 
                                                        ? 'bg-slate-50 border-slate-200' 
                                                        : 'bg-white border-indigo-100 shadow-sm hover:shadow-md cursor-pointer group'}`}
                                                    onClick={() => {
                                                        if (!isLocked) {
                                                            setViewingCapsule(capsule);
                                                            setOpeningState('gift');
                                                        } else {
                                                            showToast(`嘘！还要等 ${daysLeft} 天...`);
                                                        }
                                                    }}
                                                >
                                                    {/* State B: The Waiting (Locked Visual) */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-2 ring-indigo-100'}`}>
                                                                {isLocked ? <Lock size={20} /> : <Gift size={24} className="group-hover:animate-bounce" />}
                                                            </div>
                                                            <div>
                                                                <p className={`font-medium ${isLocked ? 'text-slate-500 blur-[0.5px]' : 'text-slate-800'}`}>
                                                                    {isLocked ? '封存的回忆' : '回忆已解锁！'}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                        <Calendar size={12} />
                                                                        {isLocked ? `还有 ${daysLeft} 天解锁` : `于 ${unlockDate.toLocaleDateString()} 开启`}
                                                                    </p>
                                                                    {/* Badges */}
                                                                    {isReceived && (
                                                                        <span className="text-[9px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold">
                                                                            来自 {capsule.user?.name || '对方'}
                                                                        </span>
                                                                    )}
                                                                    {!isReceived && capsule.type === 'PARTNER' && (
                                                                        <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                                                                            给对方
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {isLocked ? (
                                                            <div className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                                未解锁
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ChevronRight size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Delete Action - Only for creator */}
                                                    {!isReceived && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCapsule(capsule.id);
                                                            }}
                                                            className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 text-sm italic flex flex-col items-center gap-2 border border-dashed border-slate-200 rounded-2xl">
                                            <Hourglass size={24} className="opacity-20" />
                                            <p>{activeCapsuleTab === 'sent' ? '还没有埋藏胶囊' : '还没有收到胶囊'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        {/* State C: The Unboxing (Viewing Modal) */}
        <AnimatePresence>
        {viewingCapsule && (
             <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0" 
                    onClick={() => setViewingCapsule(null)}
                />
                <motion.div 
                    layoutId={`capsule-${viewingCapsule.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 min-h-[400px] flex flex-col"
                >
                    {openingState === 'gift' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-indigo-500 text-white cursor-pointer"
                             onClick={() => setOpeningState('open')}>
                             <motion.div
                                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                             >
                                <Gift size={80} strokeWidth={1} />
                             </motion.div>
                             <h3 className="mt-6 text-xl font-semibold">给你的回忆</h3>
                             <p className="mt-2 text-indigo-100 text-sm">点击拆开</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-full"
                        >
                            <div className="bg-indigo-500 p-6 text-white relative overflow-hidden">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -right-4 -top-4 text-indigo-400 opacity-20"
                                >
                                    <Sparkles size={120} />
                                </motion.div>
                                <div className="relative z-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">已解锁</p>
                                        <p className="text-white font-semibold">来自过去的消息</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto">
                                <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                                    <Calendar size={12} />
                                    原定于 {new Date(viewingCapsule.unlockDate).toLocaleDateString()}
                                </p>
                                
                                <div className="prose prose-sm prose-slate mb-6">
                                    <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{viewingCapsule.content}</p>
                                </div>

                                {viewingCapsule.images && viewingCapsule.images.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        {viewingCapsule.images.map((img: string, idx: number) => (
                                            <img key={idx} src={img} alt="Memory" className="w-full rounded-xl shadow-sm" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <button 
                                    onClick={() => setViewingCapsule(null)}
                                    className="w-full bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-medium shadow-sm active:scale-95 transition-all"
                                >
                                    关闭
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        )}
        </AnimatePresence>
            <h2 className="text-2xl font-bold text-slate-800">{name || 'User'}</h2>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
            
            {/* Group 1: Account */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-4">账户</h3>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50">
                        <span className="text-slate-600 font-medium">昵称</span>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-right text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-300"
                            placeholder="你的昵称"
                        />
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-slate-600 font-medium">密码</span>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-right text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-300"
                            placeholder="修改密码"
                        />
                    </div>
                </div>

                {/* Save Account Changes Button */}
                <button 
                    onClick={handleSaveAccount}
                    disabled={saving || (name === initialName && !password)}
                    className={`w-full py-3 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 mt-2 text-sm
                        ${(name !== initialName || password)
                            ? 'bg-slate-800 text-white shadow-md shadow-slate-200 active:scale-95' 
                            : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    保存更改
                </button>
            </div>

            {/* Group 2: App Configuration */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-4">应用设置</h3>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50">
                        <span className="text-slate-600 font-medium">相爱始于</span>
                        <input 
                            type="date"
                            value={startDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(e.target.value)}
                            onBlur={handleSaveSettings}
                            className="text-right text-slate-800 focus:outline-none bg-transparent"
                        />
                    </div>
                    <div className="flex items-center justify-between p-4">
                        <span className="text-slate-600 font-medium">访客访问</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={enableGuestAccess}
                                onChange={(e) => {
                                    setEnableGuestAccess(e.target.checked);
                                    const formData = new FormData();
                                    if (startDate) formData.append('startDate', startDate);
                                    if (e.target.checked) formData.append('enableGuestAccess', 'on');
                                    updateSystemSettings(formData);
                                }}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Group 3: Anniversaries (Click to manage) */}
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-4">内容管理</h3>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setShowAnniversaries(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-brand-pink">
                                <Calendar size={16} />
                            </div>
                            <span className="text-slate-600 font-medium">管理纪念日</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-xs">{anniversaries.length} 个事件</span>
                            <ChevronRight size={18} />
                        </div>
                    </button>
                    <div className="h-px bg-slate-50 mx-4" />
                    <button 
                        onClick={() => setShowCapsules(true)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <Hourglass size={16} />
                            </div>
                            <span className="text-slate-600 font-medium">时间胶囊</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-xs">{capsules.length} 个胶囊</span>
                            <ChevronRight size={18} />
                        </div>
                    </button>
                </div>
            </div>
        </div>

        {/* Anniversary Modal */}
        <AnimatePresence>
        {showAnniversaries && (
            <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0" 
                    onClick={() => setShowAnniversaries(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col relative z-10"
                >
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Calendar size={18} className="text-brand-pink" />
                            纪念日
                        </h3>
                        <button 
                            onClick={() => setShowAnniversaries(false)} 
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto p-4 space-y-4">
                        {/* Add New */}
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">添加新纪念日</h4>
                            <div className="flex flex-col gap-3">
                                <input 
                                    value={newAnnivTitle}
                                    onChange={(e) => setNewAnnivTitle(e.target.value)}
                                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-pink/50 bg-white text-slate-800 placeholder:text-slate-400"
                                    placeholder="事件标题 (例如：第一次约会)"
                                />
                                <div className="flex gap-2">
                                    <input 
                                        type="date"
                                        value={newAnnivDate}
                                        onChange={(e) => setNewAnnivDate(e.target.value)}
                                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-pink/50 bg-white text-slate-800"
                                    />
                                    <button 
                                        onClick={handleAddAnniversary}
                                        disabled={addingAnniv}
                                        className="px-4 bg-brand-pink text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {addingAnniv ? (
                                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Plus size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">你的纪念日</h4>
                            <div className="rounded-xl border border-slate-100 overflow-hidden bg-white">
                                {anniversaries.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {anniversaries.map((anniv) => (
                                            <div key={anniv.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-brand-pink shrink-0">
                                                        <Calendar size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{anniv.title}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {new Date(anniv.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteAnniversary(anniv.id)}
                                                    className="text-slate-300 hover:text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm italic flex flex-col items-center gap-2">
                                        <Calendar size={24} className="opacity-20" />
                                        <p>暂无纪念日</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        {/* Logout Button */}
        <button 
            onClick={() => logout()}
            className="w-full bg-white text-red-500 py-3.5 rounded-2xl font-medium shadow-sm border border-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
        >
            <LogOut size={18} />
            退出登录
        </button>

        <div className="text-center text-xs text-slate-300 py-4">
            LoveSpace v1.0.0
        </div>
        
        <ConfirmDialog
            isOpen={deleteConfirm.isOpen}
            title={deleteConfirm.title || '确认删除'}
            message="确定要删除此项吗？此操作无法撤销。"
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}
        />
      </main>
    </div>
  );
}
