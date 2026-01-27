import { getPublicProfile } from '@/app/actions/public';
import { getSystemSettings } from '@/app/actions/settings';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  const [profiles, settings] = await Promise.all([
    getPublicProfile(),
    getSystemSettings()
  ]);
  
  return <LoginClient initialProfiles={profiles} initialSettings={settings} />;
}
