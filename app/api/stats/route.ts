import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get counts for all major entities
    const [djCount, clubCount, momentCount, userCount, chatMessageCount] = await Promise.all([
      prisma.dj.count(),
      prisma.club.count(),
      prisma.moment.count(),
      prisma.user.count(),
      prisma.chatMessage.count()
    ]);

    return NextResponse.json({
      djCount,
      clubCount,
      momentCount,
      userCount,
      chatMessageCount,
      totalActivity: djCount + clubCount + momentCount + chatMessageCount
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    
    // Return default stats to prevent UI from breaking
    return NextResponse.json({
      djCount: 0,
      clubCount: 0,
      momentCount: 0,
      userCount: 0,
      chatMessageCount: 0,
      totalActivity: 0
    });
  }
} 