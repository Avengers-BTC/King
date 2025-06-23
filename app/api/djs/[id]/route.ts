import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Try to find DJ by either DJ ID or user ID
    const dj = await prisma.dj.findFirst({
      where: {
        OR: [
          { id: params.id },
          { userId: params.id }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            location: true,
            image: true,
            email: true
          }
        },
        events: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          include: {
            club: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    });

    if (!dj) {
      return NextResponse.json(
        { error: 'DJ profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dj);
  } catch (error) {
    // Log error in production but return generic message
    if (process.env.NODE_ENV === 'production') {
      console.error('[DJ API] Error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {  try {
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      genre, 
      bio, 
      currentClub, 
      instagram, 
      twitter, 
      facebook 
    } = body;
      const dj = await prisma.dj.findFirst({
      where: {
        OR: [
          { id: params.id },
          { userId: params.id }
        ]
      }
    });

    if (!dj) {
      return NextResponse.json(
        { error: 'DJ not found' },
        { status: 404 }
      );
    }

    const updatedDJ = await prisma.dj.update({
      where: { id: dj.id },
      data: {
        genres: genre ? (Array.isArray(genre) ? genre : [genre]) : undefined,
        bio: bio || undefined,
        currentClub: currentClub || null,
        instagram: instagram || null,
        twitter: twitter || null,
        facebook: facebook || null
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            location: true,
            image: true,
            email: true
          }
        },
        events: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          include: {
            club: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedDJ);  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update DJ profile' },
      { status: 500 }
    );
  }
}

