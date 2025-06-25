import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Helper function to validate ID
function isValidId(id: string | undefined): id is string {
  return typeof id === 'string' && id.length > 0;
}

// Type for PATCH request body
interface UpdateDJBody {
  genres?: string[];
  bio?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  location?: string;
  status?: 'OFFLINE' | 'PERFORMING' | 'SCHEDULED' | 'ON_BREAK';
  currentClub?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { djId: string } }
) {
  try {
    if (!isValidId(params.djId)) {
      return NextResponse.json(
        { error: 'Invalid DJ ID provided' },
        { status: 400 }
      );
    }

    const dj = await prisma.dj.findFirst({
      where: {
        OR: [
          { id: params.djId },
          { userId: params.djId }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            location: true
          }
        },
        affiliations: {
          where: {
            endDate: null // Only get current affiliations
          },
          take: 1,
          include: {
            club: {
              select: {
                id: true,
                name: true,
                location: true,
                image: true
              }
            }
          }
        },
        events: {
          where: {
            date: {
              gt: new Date()
            }
          },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                location: true,
                image: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        fanFollowers: {
          select: {
            userId: true
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

    // Transform the response to include only necessary data
    return NextResponse.json({
      id: dj.id,
      userId: dj.userId,
      genres: dj.genres,
      bio: dj.bio,
      rating: dj.rating,
      status: dj.status,
      currentClub: dj.currentClub,
      socialLinks: {
        instagram: dj.instagram,
        twitter: dj.twitter,
        facebook: dj.facebook
      },
      fans: dj.fans, // Use the fans field from schema
      fanFollowers: dj.fanFollowers.length, // Also provide follower count
      user: dj.user,
      currentClubInfo: dj.affiliations[0]?.club ?? null,
      events: dj.events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        club: event.club
      }))
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      );
    }

    console.error('Error fetching DJ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DJ' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { djId: string } }
) {
  try {
    if (!isValidId(params.djId)) {
      return NextResponse.json(
        { error: 'Invalid DJ ID provided' },
        { status: 400 }
      );
    }

    const body = await request.json() as UpdateDJBody;

    // Validate genres array if provided
    if (body.genres && (!Array.isArray(body.genres) || !body.genres.every(g => typeof g === 'string'))) {
      return NextResponse.json(
        { error: 'Genres must be an array of strings' },
        { status: 400 }
      );
    }

    // Only include defined fields in the update
    const data: Prisma.DjUpdateInput = {
      ...(body.genres && { genres: body.genres }),
      ...(body.bio && { bio: body.bio }),
      ...(body.instagram && { instagram: body.instagram }),
      ...(body.twitter && { twitter: body.twitter }),
      ...(body.facebook && { facebook: body.facebook }),
      ...(body.status && { status: body.status }),
      ...(body.currentClub !== undefined && { currentClub: body.currentClub }),
      ...(body.location && {
        user: {
          update: {
            location: body.location
          }
        }
      })
    };

    const updatedDj = await prisma.dj.update({
      where: { 
        id: params.djId 
      },
      data,
      include: {
        user: {
          select: {
            name: true,
            image: true,
            location: true
          }
        },
        fanFollowers: {
          select: {
            userId: true
          }
        }
      }
    });

    return NextResponse.json({
      id: updatedDj.id,
      userId: updatedDj.userId,
      genres: updatedDj.genres,
      bio: updatedDj.bio,
      rating: updatedDj.rating,
      status: updatedDj.status,
      currentClub: updatedDj.currentClub,
      socialLinks: {
        instagram: updatedDj.instagram,
        twitter: updatedDj.twitter,
        facebook: updatedDj.facebook
      },
      fans: updatedDj.fans,
      fanFollowers: updatedDj.fanFollowers.length,
      user: updatedDj.user
    });

  } catch (error) {
    console.error('Error updating DJ:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'DJ not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update DJ' },
      { status: 500 }
    );
  }
}
