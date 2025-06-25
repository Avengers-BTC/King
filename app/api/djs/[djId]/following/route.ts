import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { djId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { djId } = params;

    // Count total followers
    const followersCount = await prisma.fanFollowing.count({
      where: { djId }
    });

    // Check if current user is following this DJ
    const isFollowing = session.user.role === 'USER' ? await prisma.fanFollowing.findFirst({
      where: {
        djId,
        userId: session.user.id
      }
    }) : null;

    return NextResponse.json({
      followersCount,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error('Error getting DJ following status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 