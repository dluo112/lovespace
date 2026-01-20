'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';


export async function updateMood(mood: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        if (!userId) return { success: false, error: 'Not authenticated' };

        await prisma.user.update({
            where: { id: userId },
            data: { 
                mood,
                moodTime: new Date()
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update mood:', error);
        return { success: false, error: 'Failed to update mood' };
    }
}

export async function getPartnerMood() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;
        if (!userId) return { success: false, error: 'Not authenticated' };

        // Find current user to exclude
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!currentUser) return { success: false, error: 'User not found' };

        // Find partner (any other admin user)
        // In a real app with more users, you'd have a specific partner relation
        // For now, we just find the other user who is not me
        const partner = await prisma.user.findFirst({
            where: {
                id: { not: userId },
                role: 'ADMIN'
            }
        });

        return { 
            success: true, 
            data: {
                myMood: currentUser.mood,
                partnerMood: partner?.mood,
                partnerName: partner?.name || 'Partner',
                partnerMoodTime: partner?.moodTime
            }
        };
    } catch (error) {
        console.error('Failed to get mood:', error);
        return { success: false, error: 'Failed to get mood' };
    }
}

// --- Memories ---

export async function getMemories() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: memories };
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return { success: false, error: 'Failed to fetch memories' };
  }
}

export async function getPublicMemories() {
  try {
    const memories = await prisma.memory.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: memories };
  } catch (error) {
    console.error('Failed to fetch public memories:', error);
    return { success: false, error: 'Failed to fetch public memories' };
  }
}

export async function createMemory(prevState: any, formData: FormData) {
  const content = formData.get('content') as string;
  const location = formData.get('location') as string;
  const isPublic = formData.get('isPublic') === 'on';
  
  let images: string[] = [];
  try {
    const imagesStr = formData.get('images') as string;
    if (imagesStr) {
      images = JSON.parse(imagesStr);
    }
  } catch (e) {
    console.error('Failed to parse images', e);
  }

  if (!content) {
    return { success: false, error: 'Content is required' };
  }

  try {
    await prisma.memory.create({
      data: {
        content,
        location,
        isPublic,
        images,
      },
    });
    revalidatePath('/admin/timeline');
    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to create memory:', error);
    return { success: false, error: 'Failed to create memory', timestamp: Date.now() };
  }
}

export async function getMemory(id: string) {
  try {
    let memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Fallback: If not found, try finding by prefix (in case of ID truncation in URL)
    if (!memory && id.length > 10) {
      memory = await prisma.memory.findFirst({
        where: { 
          id: { startsWith: id } 
        },
        include: {
          comments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    return { success: true, data: memory };
  } catch (error) {
    console.error('Failed to fetch memory:', error);
    return { success: false, error: 'Failed to fetch memory' };
  }
}

export async function updateMemory(id: string, prevState: any, formData: FormData) {
  const content = formData.get('content') as string;
  const location = formData.get('location') as string;
  const isPublic = formData.get('isPublic') === 'on';
  
  let images: string[] = [];
  try {
    const imagesStr = formData.get('images') as string;
    if (imagesStr) {
      images = JSON.parse(imagesStr);
    }
  } catch (e) {
    console.error('Failed to parse images', e);
  }

  if (!content) {
    return { success: false, error: 'Content is required' };
  }

  try {
    await prisma.memory.update({
      where: { id },
      data: {
        content,
        location,
        isPublic,
        images,
      },
    });
    revalidatePath('/admin/timeline');
    revalidatePath(`/admin/timeline/${id}`);
    revalidatePath('/guest/timeline');
    revalidatePath(`/guest/timeline/${id}`);
    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to update memory:', error);
    return { success: false, error: 'Failed to update memory' };
  }
}

export async function deleteMemory(id: string) {
  try {
    await prisma.memory.delete({
      where: { id },
    });
    revalidatePath('/admin/timeline');
    revalidatePath('/guest/timeline');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete memory:', error);
    return { success: false, error: 'Failed to delete memory' };
  }
}

export async function createComment(memoryId: string, prevState: any, formData: FormData) {
  const content = formData.get('content') as string;
  let author = formData.get('author') as string;

  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (user?.real_name) {
        author = user.real_name;
      } else if (user?.name) {
        author = user.name;
      }
    }
  } catch (e) {
    console.error('Error fetching user for comment author:', e);
  }

  if (!author) {
    author = 'Guest';
  }

  if (!content) {
    return { success: false, error: 'Content is required' };
  }

  try {
    await prisma.comment.create({
      data: {
        content,
        author,
        memoryId,
      },
    });
    revalidatePath(`/admin/timeline/${memoryId}`);
    revalidatePath(`/guest/timeline/${memoryId}`);
    return { success: true, timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to create comment:', error);
    return { success: false, error: 'Failed to create comment' };
  }
}

// --- Anniversaries ---

export async function getAnniversaries() {
  try {
    const anniversaries = await prisma.anniversary.findMany({
      orderBy: {
        date: 'asc',
      },
    });
    return { success: true, data: anniversaries };
  } catch (error) {
    console.error('Failed to fetch anniversaries:', error);
    return { success: false, error: 'Failed to fetch anniversaries' };
  }
}

export async function createAnniversary(formData: FormData) {
    const title = formData.get('title') as string;
    const dateStr = formData.get('date') as string;
    const description = formData.get('description') as string;

    if (!title || !dateStr) {
        return { success: false, error: 'Title and date are required' };
    }

    try {
        await prisma.anniversary.create({
            data: {
                title,
                date: new Date(dateStr),
                description,
            }
        });
        revalidatePath('/admin/anniversary');
        return { success: true };
    } catch (error) {
        console.error('Failed to create anniversary:', error);
        return { success: false, error: 'Failed to create anniversary' };
    }
}

export async function deleteAnniversary(id: string) {
    try {
        await prisma.anniversary.delete({
            where: { id },
        });
        revalidatePath('/admin/anniversary');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete anniversary:', error);
        return { success: false, error: 'Failed to delete anniversary' };
    }
}

// --- Capsules ---

export async function getCapsules() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (!userId) {
        return { success: false, error: 'Not authenticated' };
    }

    const capsules = await prisma.capsule.findMany({
      where: {
        OR: [
            { userId: userId }, // Created by me
            { 
                userId: { not: userId }, // Created by partner
                type: 'PARTNER' // And meant for partner (me)
            }
        ]
      },
      include: {
        user: {
            select: {
                name: true,
                avatar: true
            }
        }
      },
      orderBy: {
        unlockDate: 'asc',
      },
    });
    return { success: true, data: capsules };
  } catch (error) {
    console.error('Failed to fetch capsules:', error);
    return { success: false, error: 'Failed to fetch capsules' };
  }
}

export async function createCapsule(formData: FormData) {
    const content = formData.get('content') as string;
    const unlockDateStr = formData.get('unlockDate') as string;
    const audio = formData.get('audio') as string;
    const type = (formData.get('type') as string) || 'SELF';
    
    let images: string[] = [];
    try {
        const imagesStr = formData.get('images') as string;
        if (imagesStr) {
            images = JSON.parse(imagesStr);
        }
    } catch (e) {
        console.error('Failed to parse images', e);
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
        return { success: false, error: 'Not authenticated' };
    }

    if (!content || !unlockDateStr) {
        return { success: false, error: 'Content and unlock date are required' };
    }

    try {
        await prisma.capsule.create({
            data: {
                content,
                unlockDate: new Date(unlockDateStr),
                isOpened: false,
                userId: userId,
                images,
                audio,
                type
            }
        });
        revalidatePath('/admin/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to create capsule:', error);
        return { success: false, error: 'Failed to create capsule' };
    }
}

export async function deleteCapsule(id: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Verify ownership
        const capsule = await prisma.capsule.findUnique({
            where: { id }
        });

        if (!capsule || capsule.userId !== userId) {
            return { success: false, error: 'Not authorized' };
        }

        await prisma.capsule.delete({
            where: { id },
        });
        revalidatePath('/admin/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete capsule:', error);
        return { success: false, error: 'Failed to delete capsule' };
    }
}
