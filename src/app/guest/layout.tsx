import { getSystemSettings } from '@/app/actions/settings';
import { redirect } from 'next/navigation';

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();
  
  // If guest access is disabled, redirect to login
  if (settings.success && settings.data && !settings.data.enableGuestAccess) {
    redirect('/login');
  }

  return (
    <>
      {children}
    </>
  );
}
