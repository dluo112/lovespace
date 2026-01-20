import { getMemories } from '@/app/actions/admin';
import { getSystemSettings } from '@/app/actions/settings';
import DaysCounter from '@/components/DaysCounter';
import TimelineList from '@/components/TimelineList';
import MoodWidget from '@/components/MoodWidget';
import PullToRevealLayout from '@/components/PullToRevealLayout';

export default async function TimelinePage() {
  const { data: memories } = await getMemories();
  const settingsRes = await getSystemSettings();
  
  // Calculate days together
  const startDate = settingsRes.data?.startDate ? new Date(settingsRes.data.startDate) : new Date();
  const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
  const daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const memoryCount = memories ? memories.length : 0;

  // Logging for debugging
  if (memories) {
    console.log('Memories IDs:', memories.map(m => m.id));
  }

  return (
    <PullToRevealLayout daysTogether={daysTogether} memoryCount={memoryCount}>
        <div className="pt-6 pb-24 px-4 max-w-md mx-auto min-h-screen">
        <DaysCounter />
        
        <MoodWidget />

        <div className="mt-6">
            <TimelineList memories={memories || []} mode="admin" />
        </div>
        </div>
    </PullToRevealLayout>
  );
}
