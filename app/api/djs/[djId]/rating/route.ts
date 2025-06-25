import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';

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