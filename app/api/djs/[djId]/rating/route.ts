import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notification-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { djId } = params;

    // Get average rating and count
    const ratings = await prisma.djRating.aggregate({
      where: { djId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    // Check if current user has rated this DJ
    const userRating = session.user.role === 'USER' ? await prisma.djRating.findFirst({
      where: {
        djId,
        userId: session.user.id
      }
    }) : null;

    return NextResponse.json({
      averageRating: ratings._avg.rating || 0,
      totalRatings: ratings._count.rating || 0,
      userRating: userRating?.rating || null
    });

  } catch (error) {
    console.error('Error getting DJ rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only fans can rate DJs
    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only fans can rate DJs' }, { status: 403 });
    }

    const { djId } = params;
    const { rating } = await request.json();

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if DJ exists
    const dj = await prisma.dj.findUnique({
      where: { id: djId }
    });

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    // Create or update rating
    const djRating = await prisma.djRating.upsert({
      where: {
        userId_djId: {
          userId: session.user.id,
          djId: djId
        }
      },
      update: {
        rating
      },
      create: {
        userId: session.user.id,
        djId: djId,
        rating
      }
    });

    // Create notification for the DJ
    try {
      await NotificationService.notifyDjRating(
        djId,
        session.user.name || 'Someone',
        rating
      );
    } catch (error) {
      console.error('Failed to create rating notification:', error);
      // Don't fail the rating operation if notification fails
    }

    return NextResponse.json({
      message: 'Rating submitted successfully',
      rating: djRating
    });

  } catch (error) {
    console.error('Error creating DJ rating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 