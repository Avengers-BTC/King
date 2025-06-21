import { PrismaClient } from '@prisma/client';

// Initialize the Prisma client
const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Delete all records in reverse order of dependencies
    // This avoids foreign key constraint errors

    // Comments
    await prisma.comment.deleteMany();
    console.log('Deleted all comments');

    // MomentLikes
    await prisma.momentLike.deleteMany();
    console.log('Deleted all moment likes');

    // Moments
    await prisma.moment.deleteMany();
    console.log('Deleted all moments');

    // Follows
    await prisma.follow.deleteMany();
    console.log('Deleted all follows');

    // Events
    await prisma.event.deleteMany();
    console.log('Deleted all events');

    // DJ Club Affiliations
    await prisma.dJClubAffiliation.deleteMany();
    console.log('Deleted all DJ club affiliations');

    // DJ Performance History
    await prisma.dJPerformanceHistory.deleteMany();
    console.log('Deleted all DJ performance history');

    // DJ Schedule
    await prisma.dJSchedule.deleteMany();
    console.log('Deleted all DJ schedules');

    // DJs
    await prisma.dJ.deleteMany();
    console.log('Deleted all DJs');

    // Clubs
    await prisma.club.deleteMany();
    console.log('Deleted all clubs');

    // Sessions
    await prisma.session.deleteMany();
    console.log('Deleted all sessions');

    // Accounts
    await prisma.account.deleteMany();
    console.log('Deleted all accounts');

    // Verification Tokens
    await prisma.verificationToken.deleteMany();
    console.log('Deleted all verification tokens');

    // Users (should be deleted last as it's referenced by many tables)
    await prisma.user.deleteMany();
    console.log('Deleted all users');

    console.log('Database reset completed successfully!');
    
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset function
resetDatabase();
