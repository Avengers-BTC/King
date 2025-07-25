import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[GET /api/users/${params.id}] Fetching user profile`);
    
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        dj: true,
        club: true,
        moments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 6,
          include: {
            likes: {
              select: {
                userId: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        },
        followingUsers: {
          include: {
            following: {
              select: {
                name: true,
                image: true,
                username: true
              }
            }
          }
        },
        followedByUsers: {
          include: {
            follower: {
              select: {
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      console.error(`[GET /api/users/${params.id}] User not found in database`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`[GET /api/users/${params.id}] User found:`, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasProfile: !!user
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET /api/users/[id]] Error fetching user:', {
      userId: params.id,
      error: error instanceof Error ? error.message : error
    });
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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
    const { name, username, bio, location } = body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: { id: params.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        username,
        bio,
        location
      },
      include: {
        dj: true,
        club: true,
        moments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 6,
          include: {
            likes: {
              select: {
                userId: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        },
        followingUsers: {
          include: {
            following: {
              select: {
                name: true,
                image: true,
                username: true
              }
            }
          }
        },
        followedByUsers: {
          include: {
            follower: {
              select: {
                name: true,
                image: true,
                username: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}