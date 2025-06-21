import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Test database connection first
    await prisma.$connect();
    
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
    
    // Return empty array instead of error object to prevent frontend map() errors
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
} 
