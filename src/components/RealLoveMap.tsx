'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { updateLocation, getPartnersLocation } from '@/app/actions/location';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';

// Custom Marker Icons
const createIcon = (url: string) => L.divIcon({
    className: 'custom-avatar-marker',
    html: `<div style="
        background-image: url('${url}');
        background-size: cover;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

export default function RealLoveMap() {
    const [myPos, setMyPos] = useState<[number, number] | null>(null);
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMyPos([lat, lng]);

                    // 2. Upload location
                    await updateLocation(lat, lng);

                    // 3. Get partners locations
                    const res = await getPartnersLocation();
                    if (res.success && res.data) {
                        setPartners(res.data);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error(err);
                    setError('Please enable location access to see the map.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen relative bg-pink-50">
            <Link href="/admin/timeline" className="absolute top-6 left-6 z-[1000] p-3 bg-white/80 rounded-full text-slate-700 backdrop-blur-md hover:bg-white transition-colors shadow-lg">
                <ArrowLeft size={24} />
            </Link>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-[2000] bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                        <Loader2 size={40} className="animate-spin text-pink-500 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">正在定位...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-[2000] bg-white">
                    <div className="text-center p-6">
                        <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">{error}</p>
                        <Link href="/admin/timeline" className="text-pink-500 mt-4 inline-block hover:underline">返回</Link>
                    </div>
                </div>
            )}

            {!loading && !error && myPos && (
                <MapContainer 
                    center={myPos} 
                    zoom={13} 
                    style={{ height: '100vh', width: '100%', zIndex: 0 }}
                    zoomControl={false}
                >
                    {/* Dreamy Map Filter */}
                    <div className="leaflet-tile-pane" style={{ filter: 'sepia(0.5) hue-rotate(320deg) saturate(1.2) contrast(0.9)' }}></div>
                    
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Partners Markers */}
                    {partners.map(p => (
                        p.lat && p.lng && (
                            <Marker 
                                key={p.id} 
                                position={[p.lat, p.lng]} 
                                icon={createIcon(p.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${p.name}`)}
                            >
                                <Popup className="custom-popup">
                                    <div className="text-center p-2">
                                        <p className="font-bold text-slate-700">{p.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            上次出现: {new Date(p.locationTime).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}

                    {/* Connection Line */}
                    {partners.length >= 2 && (
                        <Polyline 
                            positions={partners.map(p => [p.lat, p.lng])} 
                            pathOptions={{ color: '#ec4899', weight: 4, opacity: 0.6, dashArray: '10, 10' }} 
                        />
                    )}

                </MapContainer>
            )}
            
            {/* Overlay Info */}
             <div className="absolute bottom-10 left-0 right-0 z-[1000] pointer-events-none flex justify-center">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-pink-100 flex items-center gap-3"
                >
                    <div className="flex -space-x-2">
                        {partners.map(p => (
                            <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                <img src={p.avatar} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <p className="text-xs font-medium text-slate-600">
                        {partners.length > 1 ? "跨越距离的连接" : "等待对方加入..."}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
