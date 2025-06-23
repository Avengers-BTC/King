import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [topDJs, topClubs] = await Promise.all([
      prisma.dj.findMany({
        take: 5,
        orderBy: {
          rating: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }),
      prisma.club.findMany({
        take: 5,
        orderBy: {
          rating: 'desc'
        }
      })
    ]);

    return NextResponse.json({
      djs: topDJs,
      clubs: topClubs
    });
  } catch (error) {
    // Log error in production but return empty results
    if (process.env.NODE_ENV === 'production') {
      console.error('[Leaderboard] Error:', error);
    }
    return NextResponse.json({
      djs: [],
      clubs: []
    });
  }
}
