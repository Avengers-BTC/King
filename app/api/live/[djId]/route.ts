import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const { djId } = params;

    // Get live session info
    const djProfile = await prisma.dj.findUnique({
      where: { id: djId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!djProfile) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    // Get follower count for the DJ
    const followerCount = await prisma.fanFollowing.count({
      where: { djId: djId },
    });

    // Return live session data
    return NextResponse.json({
      id: djProfile.id,
      user: djProfile.user,
      genre: djProfile.genres,
      rating: djProfile.rating,
      status: djProfile.status,
      currentClub: djProfile.currentClub,
      followers: followerCount,
      isLive: djProfile.status === 'PERFORMING',
    });
  } catch (error) {
    console.error('Error fetching live session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live session' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { djId } = params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the DJ can start their own live session
    if (session.user.id !== djId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, clubId } = await request.json();

    if (action === 'start') {
      // Start live session
      await prisma.dj.update({
        where: { id: djId },
        data: {
          status: 'PERFORMING',
          currentClub: clubId,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Live session started',
        status: 'PERFORMING'
      });

    } else if (action === 'end') {
      // End live session
      await prisma.dj.update({
        where: { id: djId },
        data: {
          status: 'OFFLINE',
          currentClub: null,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Live session ended',
        status: 'OFFLINE'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing live session:', error);
    return NextResponse.json(
      { error: 'Failed to manage live session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { djId } = params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only the DJ can update their session
    if (session.user.id !== djId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { listeners, duration } = await request.json();

    // For now, we'll just acknowledge the stats update
    // In a future version, we can add a LiveSession model to track detailed analytics
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session stats updated',
      listeners: listeners || 0
    });
  } catch (error) {
    console.error('Error updating session stats:', error);
    return NextResponse.json(
      { error: 'Failed to update session stats' },
      { status: 500 }
    );
  }
} 