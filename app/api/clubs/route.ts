import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      select: {
        id: true,
        name: true,
        location: true,
        address: true,
        description: true,
        rating: true,
        capacity: true,
        dresscode: true,
        amenities: true,
        phone: true,
        website: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        openingHours: true,
        // Only include isActive if it exists in the schema
        ...(true ? { isActive: true } : {}),
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
