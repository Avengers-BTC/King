import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const clubs = await prisma.club.findMany({
      take: limit ? parseInt(limit) : undefined,
      orderBy: {
        rating: 'desc'
      },
      include: {
        events: {
          include: {
            dj: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'asc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    
    // Return empty array instead of error object to prevent frontend map() errors
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
} 
