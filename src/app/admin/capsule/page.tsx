import { getCapsules } from '@/app/actions/admin';
import { getUserProfile } from '@/app/actions/settings';
import CapsuleCard from '@/components/CapsuleCard';

export default async function CapsulePage() {
  const [capsulesRes, profileRes] = await Promise.all([
    getCapsules(),
    getUserProfile()
  ]);

  const capsules = capsulesRes.data;
  const currentUserId = profileRes.data?.id;

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-slate-200/50">
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">时间胶囊</h1>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto">
        <p className="text-slate-400 text-xs mb-6 pl-1">
          寄给未来的信
        </p>

        <div className="grid grid-cols-2 gap-3">
        {capsules?.map((capsule) => (
          <CapsuleCard key={capsule.id} capsule={capsule} currentUserId={currentUserId} />
        ))}

        {(!capsules || capsules.length === 0) && (
             <div className="col-span-2 text-center py-16 text-slate-400 text-sm italic">
                暂无埋藏的胶囊。
            </div>
        )}
      </div>
    </div>
    </div>
  );
}
