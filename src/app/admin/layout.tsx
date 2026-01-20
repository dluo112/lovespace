import BottomNav from '@/components/BottomNav';
import CreateFab from '@/components/CreateFab';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      {children}
      <CreateFab />
      <BottomNav />
    </div>
  );
}
