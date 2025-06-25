import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only fans can follow DJs
    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only fans can follow DJs' }, { status: 403 });
    }

    const { djId } = params;

    // Check if DJ exists
    const dj = await prisma.dj.findUnique({
      where: { id: djId }
    });

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.fanFollowing.findFirst({
      where: {
        djId,
        userId: session.user.id
      }
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this DJ' }, { status: 400 });
    }

    // Create the follow relationship
    await prisma.fanFollowing.create({
      data: {
        djId,
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Successfully followed DJ' });

  } catch (error) {
    console.error('Error following DJ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only fans can unfollow DJs
    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only fans can unfollow DJs' }, { status: 403 });
    }

    const { djId } = params;

    // Remove the follow relationship
    const deleted = await prisma.fanFollowing.deleteMany({
      where: {
        djId,
        userId: session.user.id
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Not following this DJ' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Successfully unfollowed DJ' });

  } catch (error) {
    console.error('Error unfollowing DJ:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 