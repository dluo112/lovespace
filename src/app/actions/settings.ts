'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getUserProfile() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const username = cookieStore.get('user_role')?.value; // fallback

  if (!userId && !username) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { username: username }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to fetch profile' };
  }
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const username = cookieStore.get('user_role')?.value;

  if (!userId && !username) {
    return { success: false, error: 'Not authenticated' };
  }

  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const avatar = formData.get('avatar') as string;

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (avatar) updateData.avatar = avatar;

    await prisma.user.update({
      where: userId ? { id: userId } : { username: username },
      data: updateData
    });

    revalidatePath('/admin/profile');
    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function getSystemSettings() {
  try {
    // Assuming singleton config. If not exists, create one.
    let config = await prisma.appConfig.findFirst();
    if (!config) {
        config = await prisma.appConfig.create({
            data: {}
        });
    }
    return { success: true, data: config };
  } catch (error) {
    console.error('Get settings error:', error);
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateSystemSettings(formData: FormData) {
  const startDate = formData.get('startDate') as string;
  const enableGuestAccess = formData.get('enableGuestAccess') === 'on';

  try {
    let config = await prisma.appConfig.findFirst();
    
    if (config) {
        await prisma.appConfig.update({
            where: { id: config.id },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                enableGuestAccess: enableGuestAccess
            }
        });
    } else {
        await prisma.appConfig.create({
            data: {
                startDate: startDate ? new Date(startDate) : new Date(),
                enableGuestAccess: enableGuestAccess
            }
        });
    }

    revalidatePath('/admin/profile');
    revalidatePath('/login');
    revalidatePath('/guest');
    return { success: true };
  } catch (error) {
    console.error('Update settings error:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
