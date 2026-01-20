import { getMemory } from '@/app/actions/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import GuestCommentForm from './GuestCommentForm';

export default async function GuestMemoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { data: memory } = await getMemory(id);

  if (!memory || !memory.isPublic) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-200/50">
        <Link href="/guest/timeline" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-semibold text-slate-800 tracking-tight flex-1">Memory Details</h1>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
              <Clock size={12} />
              {new Date(memory.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {/* Text Content */}
          <p className="text-slate-700 leading-relaxed font-sans text-base whitespace-pre-wrap mb-6">
            {memory.content}
          </p>

          {/* Image Gallery */}
          {Array.isArray(memory.images) && memory.images.length > 0 && (
            <div className="space-y-3 mb-6">
              {memory.images.map((img: any, idx: number) => (
                <div key={idx} className="relative w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                   <img 
                    src={img as string} 
                    alt={`Memory image ${idx + 1}`}
                    className="w-full h-auto object-contain max-h-[500px]"
                    loading="lazy"
                   />
                </div>
              ))}
            </div>
          )}

          {/* Location */}
          {memory.location && (
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-50">
              <MapPin size={16} className="text-brand-pink" />
              {memory.location}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-2">评论</h3>
          
          {/* Comment List */}
          <div className="space-y-3">
            {memory.comments && memory.comments.length > 0 ? (
              memory.comments.map((comment: any) => (
                <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 text-sm">{comment.author}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm italic bg-white/50 rounded-xl border border-dashed border-slate-200">
                暂无评论，快来抢沙发！
              </div>
            )}
          </div>

          {/* Comment Form */}
          <GuestCommentForm memoryId={memory.id} />
        </div>
      </main>
    </div>
  );
}
