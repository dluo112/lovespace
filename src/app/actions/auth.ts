'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

const DEFAULT_AVATARS = {
  boy: "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
  girl: "https://api.dicebear.com/9.x/adventurer/svg?seed=Eliza&backgroundColor=ffdfbf"
};

const DEFAULT_NAMES = {
  boy: "HIM",
  girl: "HER"
};

const DEFAULT_REAL_NAMES = {
  boy: "罗登",
  girl: "袁萍"
};
export async function login(prevState: any, formData: FormData) {
  const role = formData.get('role') as string; // 'boy' or 'girl'
  const password = formData.get('password') as string;

  if (!role || !password) {
    return { error: 'Please select a role and enter password' };
  }

  try {
    // 1. Find or create user
    // In a real app, we wouldn't auto-create on login like this, but for this private app setup it's convenient
    // We check if the user exists
    let user = await prisma.user.findUnique({
      where: { username: role }
    });

    const SECRET_PASSWORD = process.env.App_PASSWORD || 'love2026';

    // First time setup or fallback: if user doesn't exist, create it with default password
    if (!user) {
      // For security in production, this logic should be removed or behind a setup flag.
      // Here we assume if the user inputs the default env password, we initialize the DB record.
      if (password === SECRET_PASSWORD) {
        user = await prisma.user.create({
          data: {
            username: role,
            password: SECRET_PASSWORD, // Storing plain text as requested for simplicity
            role: Role.ADMIN,
            avatar: DEFAULT_AVATARS[role as keyof typeof DEFAULT_AVATARS],
            name: DEFAULT_NAMES[role as keyof typeof DEFAULT_NAMES],
            real_name: DEFAULT_REAL_NAMES[role as keyof typeof DEFAULT_REAL_NAMES]
          }
        });
      } else {
         return { error: 'Initial setup requires the secret key' };
      }
    } else {
      // Validate password against DB
      if (user.password !== password) {
         return { error: 'Incorrect password' };
      }
    }

    // 2. Set Session
    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', 'valid_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('user_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Also store the user ID for future reference
    cookieStore.set('user_id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Something went wrong during login' };
  }

  redirect('/admin/timeline');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('user_role');
  cookieStore.delete('user_id');
  redirect('/login');
}
