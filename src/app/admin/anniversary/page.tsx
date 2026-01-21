import { getAnniversaries } from '@/app/actions/admin';
import { Calendar, Heart, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getDaysUntil(date: Date) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const targetDate = new Date(date);
  
  // Set the target year to current year to check if it has passed
  let nextDate = new Date(currentYear, targetDate.getMonth(), targetDate.getDate());
  
  // Reset hours to avoid time issues
  now.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  // If the date has already passed this year, set it to next year
  if (nextDate < now) {
    nextDate.setFullYear(currentYear + 1);
  }
  
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default async function AnniversaryPage() {
  const { data: anniversaries } = await getAnniversaries();

  // Sort by days remaining
  const sortedAnniversaries = anniversaries?.map(a => ({
    ...a,
    daysRemaining: getDaysUntil(a.date),
    nextDate: (() => {
        const d = new Date(a.date);
        d.setFullYear(new Date().getFullYear());
        if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
        return d;
    })()
  })).sort((a, b) => a.daysRemaining - b.daysRemaining) || [];

  const nextEvent = sortedAnniversaries[0];
  const otherEvents = sortedAnniversaries.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50">
        <h1 className="text-2xl font-serif text-slate-800 tracking-tight italic">纪念日</h1>
        <Link href="/admin/profile" className="text-xs font-medium text-brand-pink bg-brand-pink/10 px-3 py-1.5 rounded-full hover:bg-brand-pink/20 transition-colors">
            管理
        </Link>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-8">
        {/* Hero Card - Next Event */}
        {nextEvent ? (
          <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-pink-200/50 bg-gradient-to-br from-[#FFB6C1] via-purple-400 to-indigo-400 text-white p-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Heart size={120} fill="currentColor" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-xs font-medium tracking-[0.3em] uppercase opacity-80 mb-2">下一次庆祝</span>
                <h2 className="text-3xl font-bold mb-1 font-serif">{nextEvent.title}</h2>
                <p className="text-sm opacity-90 mb-8 font-medium">
                    {nextEvent.nextDate.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-7xl font-bold tracking-tighter">
                        {nextEvent.daysRemaining}
                    </span>
                    <span className="text-lg font-medium opacity-80">天后</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Calendar size={24} />
             </div>
             <p className="text-slate-400 text-sm">暂无即将到来的纪念日</p>
             <Link href="/admin/profile" className="inline-block mt-4 text-brand-pink text-sm font-medium">
                去个人中心添加
             </Link>
          </div>
        )}

        {/* Other Events List */}
        {otherEvents.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-4">即将到来</h3>
                <div className="grid gap-3">
                    {otherEvents.map((event) => (
                        <div key={event.id} className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-pink-50 transition-colors flex items-center justify-center text-slate-400 group-hover:text-brand-pink">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-700 text-base">{event.title}</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        {event.nextDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-slate-800 tabular-nums">
                                    {event.daysRemaining}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">天</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
