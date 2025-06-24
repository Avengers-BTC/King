import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { djId: string } }
) {
  try {
    const djId = params.djId;
    
    if (!djId) {
      return NextResponse.json({ error: 'DJ ID is required' }, { status: 400 });
    }
    
    // Find the DJ with user data and upcoming events
    const dj = await prisma.dj.findUnique({
      where: { id: djId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            location: true,
          },
        },
        events: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
          where: {
            date: {
              gte: new Date(),
            },
          },
          take: 5,
        },
        // Count related records
        _count: {
          select: {
            fanFollowers: true,  // Changed from fans to fanFollowers
            ratings: true,
          },
        },
      },
    });
    
    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }
    
    // Calculate average rating
    const ratings = await prisma.djRating.findMany({
      where: {
        djId: djId,
      },
      select: {
        rating: true,
      },
    });
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / ratings.length
      : 0;
    
    // Return enhanced DJ data
    return NextResponse.json({
      ...dj,
      fanCount: dj._count.fanFollowers, // Changed from fans to fanFollowers
      ratingCount: dj._count.ratings,
      avgRating,
    });
  } catch (error) {
    console.error('Error fetching DJ:', error);
    return NextResponse.json(
      { error: 'Error fetching DJ information' },
      { status: 500 }
    );
  }
}
