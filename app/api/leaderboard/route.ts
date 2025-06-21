import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [topDJs, topClubs] = await Promise.all([
      prisma.dJ.findMany({
        take: 5,
        orderBy: {
          rating: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              location: true
            }
          }
        }
      }),
      prisma.club.findMany({
        take: 5,
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
      })
    ]);

    return NextResponse.json({
      topDJs,
      topClubs
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 
