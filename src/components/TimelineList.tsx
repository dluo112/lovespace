'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';

interface Memory {
  id: string;
  content: string;
  images: string[] | any;
  createdAt: Date | string;
  location?: string | null;
  isPublic: boolean;
}

interface TimelineListProps {
  memories: Memory[];
  mode: 'admin' | 'guest';
}

interface GroupedMemories {
  id: string; // YYYY-MM
  year: number;
  month: number;
  memories: Memory[];
}

export default function TimelineList({ memories, mode }: TimelineListProps) {
  const [activeGroup, setActiveGroup] = useState<string>('');
  
  // Group memories by Year-Month
  const groupedMemories = useMemo(() => {
    const groups: { [key: string]: GroupedMemories } = {};
    
    memories?.forEach(memory => {
      const date = new Date(memory.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!groups[key]) {
        groups[key] = {
          id: key,
          year,
          month,
          memories: []
        };
      }
      
      groups[key].memories.push(memory);
    });
    
    // Sort groups by date descending (newest first)
    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [memories]);

  // Set initial active group
  useEffect(() => {
    if (groupedMemories.length > 0 && !activeGroup) {
      setActiveGroup(groupedMemories[0].id);
    }
  }, [groupedMemories, activeGroup]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use data-group-id attribute to identify the group
            const groupId = entry.target.getAttribute('data-group-id');
            if (groupId) {
              setActiveGroup(groupId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when element is near top
        threshold: 0
      }
    );

    // Observe all group elements
    document.querySelectorAll('.timeline-group').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groupedMemories]);

  const handleScrollToGroup = (groupId: string) => {
    setActiveGroup(groupId);
    const element = document.getElementById(`group-${groupId}`);
    if (element) {
      // Calculate offset to account for sticky headers or spacing
      const offset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!memories || memories.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm italic">
        {mode === 'admin' ? '暂无回忆。点击 + 按钮开始记录吧！' : '暂无公开回忆。'}
      </div>
    );
  }

  return (
    <div className="flex relative">
      {/* Left Navigation (Sticky) */}
      <div className="w-12 flex-shrink-0 flex flex-col items-center sticky top-20 h-[calc(100vh-100px)] py-4 mr-2">
        {/* Vertical Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-100 -translate-x-1/2 z-0 rounded-full" />
        
        {/* Navigation Dots */}
        <div className="relative z-10 flex flex-col gap-6 w-full items-center overflow-y-auto no-scrollbar py-2">
          {groupedMemories.map((group, index) => {
            const isActive = activeGroup === group.id;
            const isNewYear = index === 0 || groupedMemories[index - 1].year !== group.year;
            
            return (
              <div key={group.id} className="flex flex-col items-center gap-1 shrink-0">
                {/* Year Label (only if year changes) */}
                {isNewYear && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1 rounded mb-1">
                    {group.year}
                  </span>
                )}
                
                {/* Dot / Button */}
                <button
                  onClick={() => handleScrollToGroup(group.id)}
                  className={`
                    relative flex items-center justify-center transition-all duration-300
                    ${isActive ? 'w-8 h-8' : 'w-6 h-6 hover:scale-110'}
                  `}
                  title={`${group.year}-${String(group.month + 1).padStart(2, '0')}`}
                >
                  <div 
                    className={`
                      rounded-full transition-all duration-300 shadow-sm
                      ${isActive 
                        ? 'w-3 h-3 bg-rose-500 ring-4 ring-rose-100' 
                        : 'w-2 h-2 bg-slate-300 hover:bg-rose-300'
                      }
                    `}
                  />
                  
                  {/* Month Label (visible on hover or active) */}
                  <span className={`
                    absolute left-full ml-2 text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-800 text-white
                    transition-opacity duration-200 pointer-events-none
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                  `}>
                    {new Date(group.year, group.month).toLocaleString('zh-CN', { month: 'short' })}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content List */}
      <div className="flex-1 min-w-0 space-y-10 pb-24">
        {groupedMemories.map((group) => (
          <div 
            key={group.id} 
            id={`group-${group.id}`}
            data-group-id={group.id}
            className="timeline-group scroll-mt-24 space-y-4"
          >
            {/* Month Header */}
            <div className="sticky top-16 z-20 bg-slate-50/90 backdrop-blur-sm py-2 px-2 -mx-2 mb-2 flex items-baseline gap-2 border-b border-slate-100/50">
              <span className="text-lg font-bold text-slate-700">
                {new Date(group.year, group.month).toLocaleString('zh-CN', { month: 'long' })}
              </span>
              <span className="text-sm text-slate-400 font-medium">
                {group.year}
              </span>
            </div>

            {/* Memories in this group */}
            <div className="space-y-4">
              {group.memories.map((memory) => {
                const hasImages = Array.isArray(memory.images) && memory.images.length > 0;
                const basePath = mode === 'admin' ? '/admin/timeline' : '/guest/timeline';
                
                return (
                  <Link 
                    href={`${basePath}/${memory.id}`}
                    key={memory.id} 
                    className="block bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.99]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <Clock size={10} />
                        <span suppressHydrationWarning>
                          {new Date(memory.createdAt).toLocaleString('zh-CN', {
                            timeZone: 'Asia/Shanghai',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      </div>
                      {mode === 'admin' && memory.isPublic && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                          公开
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-slate-600 text-sm leading-relaxed font-sans line-clamp-3 break-words flex-1">
                        {memory.content}
                      </p>
                      
                      {hasImages && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                          <img 
                            src={Array.isArray(memory.images) ? (memory.images[0] as string) : ''} 
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            suppressHydrationWarning
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-full">
                        {memory.location ? (
                          <>
                            <MapPin size={10} className="flex-shrink-0" />
                            <span className="truncate">{memory.location}</span>
                          </>
                        ) : (
                          <span className="opacity-0">无位置信息</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
