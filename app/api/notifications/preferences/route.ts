import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      emailNotifications,
      pushNotifications,
      djLiveNotifications,
      newFollowerNotifications,
      eventReminders,
      chatMentions,
      momentLikes,
      systemUpdates,
    } = await request.json();

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications,
        pushNotifications,
        djLiveNotifications,
        newFollowerNotifications,
        eventReminders,
        chatMentions,
        momentLikes,
        systemUpdates,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        pushNotifications,
        djLiveNotifications,
        newFollowerNotifications,
        eventReminders,
        chatMentions,
        momentLikes,
        systemUpdates,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
} 