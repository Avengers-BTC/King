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

    // Check if already following
    const existingFollow = await prisma.fanFollowing.findUnique({
      where: {
        userId_djId: {
          userId: session.user.id,
          djId: params.id
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.fanFollowing.delete({
        where: {
          userId_djId: {
            userId: session.user.id,
            djId: params.id
          }
        }
      });

      // Update DJ's fan count
      await prisma.dj.update({
        where: { id: params.id },
        data: {
          fans: {
            decrement: 1
          }
        }
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.fanFollowing.create({
        data: {
          userId: session.user.id,
          djId: params.id
        }
      });

      // Update DJ's fan count
      await prisma.dj.update({
        where: { id: params.id },
        data: {
          fans: {
            increment: 1
          }
        }
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error('Error updating follow status:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update follow status' }),
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

    const following = await prisma.fanFollowing.findUnique({
      where: {
        userId_djId: {
          userId: session.user.id,
          djId: params.id
        }
      }
    });

    return NextResponse.json({ following: !!following });
  } catch (error) {
    console.error('Error getting follow status:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to get follow status' }),
      { status: 500 }
    );
  }
}
