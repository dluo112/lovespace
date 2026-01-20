'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updateLocation(lat: number, lng: number) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        if (!userId) return { success: false, error: 'Not authenticated' };

        await prisma.user.update({
            where: { id: userId },
            data: { 
                lat,
                lng,
                locationTime: new Date()
            }
        });

        revalidatePath('/admin/secret/map');
        return { success: true };
    } catch (error) {
        console.error('Failed to update location:', error);
        return { success: false, error: 'Failed to update location' };
    }
}

export async function getPartnersLocation() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        if (!userId) return { success: false, error: 'Not authenticated' };

        const users = await prisma.user.findMany({
            where: {
                role: 'ADMIN',
                lat: { not: null },
                lng: { not: null }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                lat: true,
                lng: true,
                locationTime: true
            }
        });

        return { success: true, data: users };
    } catch (error) {
        console.error('Failed to get locations:', error);
        return { success: false, error: 'Failed to get locations' };
    }
}

export async function reverseGeocodeAmap(lat: number, lng: number) {
  try {
    const key = process.env.AMAP_KEY;
    if (!key) {
        return { success: false, error: 'Missing AMAP_KEY' };
    }
    
    const res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?output=json&location=${lng},${lat}&key=${key}&radius=1000&extensions=all&coordsys=gps`);
    const data = await res.json();
    
    if (data.status === '1' && data.regeocode) {
        return { success: true, address: data.regeocode.formatted_address };
    }
    return { success: false, error: 'AMap API Error' };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return { success: false, error: 'Failed to reverse geocode' };
  }
}
