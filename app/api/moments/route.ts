import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const moments = await prisma.moment.findMany({
      take: limit ? parseInt(limit) : 6,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            username: true
          }
        },
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
    });

    return NextResponse.json(moments);
  } catch (error) {
    console.error('Error fetching moments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moments' },
      { status: 500 }
    );
  }
} 
