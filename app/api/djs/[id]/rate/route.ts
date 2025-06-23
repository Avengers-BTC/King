import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth-options';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const { rating } = await request.json();
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid rating value' }),
        { status: 400 }      );
    }

    // Check if DJ exists
    const dj = await prisma.dj.findUnique({
      where: { id: params.id }
    });

    if (!dj) {
      return new NextResponse(
        JSON.stringify({ error: 'DJ not found' }),
        { status: 404 }
      );
    }

    // Upsert the rating
    await prisma.djRating.upsert({
      where: {
        userId_djId: {
          userId: session.user.id,
          djId: params.id
        }
      },
      create: {
        userId: session.user.id,
        djId: params.id,
        rating
      },
      update: {
        rating
      }
    });    // Update the DJ's average rating
    const allRatings = await prisma.djRating.findMany({
      where: { djId: params.id }
    });

    const averageRating = allRatings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allRatings.length;
    
    await prisma.dj.update({
      where: { id: params.id },
      data: { rating: averageRating }
    });

    return NextResponse.json({ success: true, rating: rating });
  } catch (error) {
    console.error('Error rating DJ:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update rating' }),
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const rating = await prisma.djRating.findUnique({
      where: {
        userId_djId: {
          userId: session.user.id,
          djId: params.id
        }
      }
    });

    return NextResponse.json({ rating: rating?.rating || null });
  } catch (error) {
    console.error('Error getting DJ rating:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to get rating' }),
      { status: 500 }
    );
  }
}
