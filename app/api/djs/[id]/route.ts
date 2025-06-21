import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dj = await prisma.dJ.findUnique({
      where: { userId: params.id },
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
        { error: 'DJ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dj);
  } catch (error) {
    console.error('Error fetching DJ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      genre, 
      bio, 
      currentClub, 
      instagram, 
      twitter, 
      facebook 
    } = body;    const updatedDJ = await prisma.dJ.update({
      where: { userId: params.id },
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

    return NextResponse.json(updatedDJ);
  } catch (error) {
    console.error('Error updating DJ:', error);
    return NextResponse.json(
      { error: 'Failed to update DJ profile' },
      { status: 500 }
    );
  }
} 