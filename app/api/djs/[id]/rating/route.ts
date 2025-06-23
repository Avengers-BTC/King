import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DjRating } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const djId = params.id;

    // Get DJ's average rating
    const ratings = await prisma.djRating.findMany({
      where: {
        djId: djId
      }
    });    const averageRating = ratings.length > 0
      ? ratings.reduce((acc: number, rating: DjRating) => acc + rating.rating, 0) / ratings.length
      : 0;

    return NextResponse.json({
      rating: averageRating,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('[DJ Rating] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch DJ rating' }, { status: 500 });
  }
}
