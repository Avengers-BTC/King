import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const djs = await prisma.dj.findMany({
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

    return NextResponse.json(djs);  } catch (error) {
    return NextResponse.json([], { status: 200 });
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

    if (!userId || !genre || !bio || !djName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, genre, djName, and bio are required' },
        { status: 400 }
      );
    }

    // Convert genre to array if it's a single string
    const genres = Array.isArray(genre) ? genre : [genre];

    // Check if user already has a DJ profile
    const existingDJ = await prisma.dj.findUnique({
      where: { userId }
    });

    if (existingDJ) {
      return NextResponse.json(
        { error: 'DJ profile already exists for this user' },
        { status: 400 }
      );
    }

    // Start a transaction to create DJ profile and update user
    type UserRole = 'USER' | 'DJ' | 'CLUB_OWNER' | 'ADMIN';    interface UpdatedUser {
      id: string;
      name: string | null;
      email: string | null;
      username: string | null;
      location: string | null;
      image: string | null;
      role: UserRole;
    }type DJStatus = 'OFFLINE' | 'PERFORMING' | 'SCHEDULED' | 'ON_BREAK';
    
    interface DJProfile {
      id: string;
      userId: string;
      genres: string[];
      bio: string | null;
      status: DJStatus;
      currentClub: string | null;
      instagram: string | null;
      twitter: string | null;
      facebook: string | null;
      user: {
        name: string | null;
        email: string | null;
        username: string | null;
        location: string | null;
        image: string | null;
        role: UserRole;
      };
    }interface TransactionResult {
      dj: DJProfile;
      user: UpdatedUser;
    }
    
    type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
        
    const result = await prisma.$transaction(async (tx: TransactionClient): Promise<TransactionResult> => {
          // Update user role to DJ and set display name
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { 
              role: 'DJ',
              name: djName
            }
          });

          // Create DJ profile
          const dj = await tx.dj.create({
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
                  image: true,
                  role: true
                }
              }
            }
          });

          return { dj, user: updatedUser };
        });

    return NextResponse.json({
      success: true,
      data: result.dj,
      user: result.user,
      redirect: '/dj/dashboard'
    });
  } catch (error) {    return NextResponse.json(
      { error: 'Failed to create DJ profile' },
      { status: 500 }
    );
  }
}


