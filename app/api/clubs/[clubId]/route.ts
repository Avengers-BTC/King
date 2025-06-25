import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { clubId: string } }
) {
  try {
    const club = await prisma.club.findUnique({
      where: { id: params.clubId },
      include: {
        events: {
          include: {
            dj: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        },
        user: true,
        djAffiliations: {
          include: {
            dj: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Find the current/resident DJ (if any) from the affiliations
    const residentDj = club.djAffiliations.find(
      affiliation => affiliation.type === 'RESIDENT' && (!affiliation.endDate || new Date(affiliation.endDate) > new Date())
    )?.dj;

    // Transform the response to match the expected format
    const response = {
      ...club,
      currentDj: residentDj ? {
        id: residentDj.id,
        userId: residentDj.userId,
        user: residentDj.user
      } : null,
      // Clean up the response by removing fields we don't need to send
      djAffiliations: undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    );
  }
}
