// Reset database script
import { prisma } from '../lib/prisma';

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Delete all data in reverse order of dependencies
    
    // Comments
    await prisma.comment.deleteMany();
    console.log('Deleted all comments');

    // Moments and likes
    await prisma.momentLike.deleteMany();
    await prisma.moment.deleteMany();
    console.log('Deleted all moments and likes');

    // Events and schedules
    await prisma.djSchedule.deleteMany();
    await prisma.event.deleteMany();
    console.log('Deleted all events and schedules');

    // Clubs
    await prisma.club.deleteMany();
    console.log('Deleted all clubs');

    // DJ-related tables
    await prisma.djRating.deleteMany();
    await prisma.djClubAffiliation.deleteMany();
    await prisma.djPerformanceHistory.deleteMany();
    console.log('Deleted all DJ ratings, affiliations, and history');

    // Fan followings
    await prisma.fanFollowing.deleteMany();
    console.log('Deleted all fan followings');

    // User relationships
    await prisma.follow.deleteMany();
    console.log('Deleted all user follows');

    // DJs
    await prisma.dj.deleteMany();
    console.log('Deleted all DJs');

    // Auth-related tables
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    console.log('Deleted all auth-related data');
    
    // Users (must be last due to relationships)
    await prisma.user.deleteMany();
    console.log('Deleted all users');

    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
