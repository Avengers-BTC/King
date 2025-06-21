import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const djs = await prisma.dJ.findMany({
      take: limit ? parseInt(limit) : undefined,
      include: {
        user: {
          select: {
            name: true,
            image: true,
            username: true,
            location: true
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
          take: 3,
          include: {
            club: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return NextResponse.json(djs);
  } catch (error) {
    console.error('Error fetching DJs:', error);
    
    // Return empty array instead of error object to prevent frontend map() errors
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      djName, 
      genre, 
      bio, 
      instagram, 
      twitter, 
      facebook, 
      currentClub 
    } = body;

    console.log('DJ Profile creation request:', { userId, genre, bio, djName });

    if (!userId || !genre || !bio || !djName) {
      console.log('Missing required fields:', { 
        userId: !!userId, 
        genre: !!genre,
        bio: !!bio,
        djName: !!djName 
      });
      return NextResponse.json(
        { error: 'Missing required fields: userId, genre, djName, and bio are required' },
        { status: 400 }
      );
    }

    // Convert genre to array if it's a single string
    const genres = Array.isArray(genre) ? genre : [genre];

    // Check if user already has a DJ profile
    const existingDJ = await prisma.dJ.findUnique({
      where: { userId }
    });

    if (existingDJ) {
      return NextResponse.json(
        { error: 'DJ profile already exists for this user' },
        { status: 400 }
      );
    }

    // Start a transaction to create DJ profile and update user
    const result = await prisma.$transaction(async (tx) => {
      // Update user role to DJ and set display name
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: 'DJ',
          name: djName
        }
      });

      // Create DJ profile
      const dj = await tx.dJ.create({
        data: {
          userId,
          genres,
          bio,
          status: 'OFFLINE',
          currentClub: currentClub || null,
          instagram: instagram || null,
          twitter: twitter || null,
          facebook: facebook || null
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              username: true,
              location: true,
              image: true
            }
          }
        }
      });

      return dj;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating DJ profile:', error);
    return NextResponse.json(
      { error: 'Failed to create DJ profile' },
      { status: 500 }
    );
  }
}


