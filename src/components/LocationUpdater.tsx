'use client';

import { useEffect } from 'react';
import { updateLocation } from '@/app/actions/location';

export default function LocationUpdater() {
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await updateLocation(latitude, longitude);
          console.log('Location updated automatically');
        } catch (error) {
          console.error('Failed to auto-update location', error);
        }
      },
      (error) => {
        console.warn('Auto location update failed:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return null; // This component doesn't render anything
}
