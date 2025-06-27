import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const momentId = params.id;

    // Check if moment exists
    const moment = await prisma.moment.findUnique({
      where: { id: momentId },
      select: { userId: true, title: true },
    });

    if (!moment) {
      return NextResponse.json({ error: 'Moment not found' }, { status: 404 });
    }

    // Check if user already liked this moment
    const existingLike = await prisma.momentLike.findUnique({
      where: {
        momentId_userId: {
          momentId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the moment
      await prisma.momentLike.delete({
        where: {
          momentId_userId: {
            momentId,
            userId: session.user.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        message: 'Moment unliked',
      });
    } else {
      // Like the moment
      await prisma.momentLike.create({
        data: {
          momentId,
          userId: session.user.id,
        },
      });

      // Create notification for the moment owner (but not if they liked their own moment)
      if (moment.userId !== session.user.id) {
        try {
          await NotificationService.notifyMomentLike(
            momentId,
            session.user.name || 'Someone',
            session.user.id
          );
        } catch (error) {
          console.error('Failed to create like notification:', error);
          // Don't fail the like operation if notification fails
        }
      }

      return NextResponse.json({
        success: true,
        liked: true,
        message: 'Moment liked',
      });
    }
  } catch (error) {
    console.error('Error toggling moment like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const momentId = params.id;

    // Get like status for the current user
    const existingLike = await prisma.momentLike.findUnique({
      where: {
        momentId_userId: {
          momentId,
          userId: session.user.id,
        },
      },
    });

    // Get total like count
    const likeCount = await prisma.momentLike.count({
      where: { momentId },
    });

    return NextResponse.json({
      liked: !!existingLike,
      likeCount,
    });
  } catch (error) {
    console.error('Error getting moment like status:', error);
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    );
  }
} 