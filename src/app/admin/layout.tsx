import BottomNav from '@/components/BottomNav';
import CreateFab from '@/components/CreateFab';
import LocationUpdater from '@/components/LocationUpdater';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      <LocationUpdater />
      {children}
      <CreateFab />
      <BottomNav />
    </div>
  );
}
