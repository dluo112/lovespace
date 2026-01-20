'use client';

import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues with Leaflet
const RealLoveMap = dynamic(() => import('@/components/RealLoveMap'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-pink-400 animate-pulse">地图加载中...</p>
    </div>
  )
});

export default function MapPage() {
  return <RealLoveMap />;
}
