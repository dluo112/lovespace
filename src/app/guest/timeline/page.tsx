import { getPublicMemories } from '@/app/actions/admin';
import DaysCounter from '@/components/DaysCounter';
import TimelineList from '@/components/TimelineList';

export default async function GuestTimelinePage() {
  const { data: memories } = await getPublicMemories();

  return (
    <div className="min-h-screen">
      <div className="pt-6 pb-24 px-4 max-w-md mx-auto">
        <DaysCounter />
        
        <div className="mt-6">
          <TimelineList memories={memories || []} mode="guest" />
        </div>
      </div>
    </div>
  );
}
