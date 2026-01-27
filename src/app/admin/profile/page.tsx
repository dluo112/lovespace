import { getUserProfile, getSystemSettings } from '@/app/actions/settings';
import { getAnniversaries, getCapsules } from '@/app/actions/admin';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const [profileRes, settingsRes, annivRes, capsuleRes] = await Promise.all([
    getUserProfile(),
    getSystemSettings(),
    getAnniversaries(),
    getCapsules()
  ]);

  return (
    <ProfileClient 
        initialProfile={profileRes} 
        initialSettings={settingsRes} 
        initialAnniversaries={annivRes.data || []} 
        initialCapsules={capsuleRes.data || []} 
    />
  );
}
