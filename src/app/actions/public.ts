'use server';

import { prisma } from '@/lib/prisma';

export async function getPublicProfile() {
  try {
    const boy = await prisma.user.findUnique({ where: { username: 'boy' } });
    const girl = await prisma.user.findUnique({ where: { username: 'girl' } });

    return {
      boy: {
        avatar: boy?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
        name: boy?.name || "HIM"
      },
      girl: {
        avatar: girl?.avatar || "https://api.dicebear.com/9.x/adventurer/svg?seed=Eliza&backgroundColor=ffdfbf",
        name: girl?.name || "HER"
      }
    };
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    return {
      boy: {
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
        name: "HIM"
      },
      girl: {
        avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Eliza&backgroundColor=ffdfbf",
        name: "HER"
      }
    };
  }
}
