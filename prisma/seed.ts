import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    console.log('Starting to seed the database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@nightvibe.com' },
      update: {},
      create: {
        email: 'admin@nightvibe.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        location: 'Nairobi, Kenya',
        username: 'admin',
        bio: 'NightVibe platform administrator'
      },
    });

    console.log('✅ Admin user created');

    // Create sample DJ users
    const djUsers = [
      {
        email: 'dj.amara@example.com',
        name: 'DJ Amara',
        username: 'dj_amara',
        bio: 'Amapiano specialist bringing the best South African vibes to Kenya',
        location: 'Nairobi, Kenya'
      },
      {
        email: 'dj.kevo@example.com', 
        name: 'DJ Kevo',
        username: 'dj_kevo',
        bio: 'Afrobeats and dancehall master keeping the dance floor alive',
        location: 'Mombasa, Kenya'
      },
      {
        email: 'dj.leila@example.com',
        name: 'DJ Leila',
        username: 'dj_leila', 
        bio: 'House music queen with electronic vibes that move souls',
        location: 'Kisumu, Kenya'
      }
    ];

    const createdDJUsers = [];
    for (const djData of djUsers) {
      const djUser = await prisma.user.upsert({
        where: { email: djData.email },
        update: {},
        create: {
          ...djData,
          password: await bcrypt.hash('password123', 12),
          role: 'DJ',
        },
      });
      createdDJUsers.push(djUser);
    }

    console.log('✅ DJ users created');

    // Create DJ profiles
    const djProfiles = [
      {
        userId: createdDJUsers[0].id,        genres: ['Amapiano'],
        rating: 4.8,
        fans: 2500,
        bio: 'Specialized in Amapiano with 5+ years experience. Known for seamless mixes and crowd interaction.',
        instagram: '@dj.amara',
        twitter: '@djamara_ke'
      },
      {
        userId: createdDJUsers[1].id,        genres: ['Afrobeats', 'Dancehall'],
        rating: 4.6,
        fans: 1800,
        bio: 'Afrobeats and dancehall specialist. Bringing the Caribbean-African fusion to the coast.',
        instagram: '@dj.kevo',
        twitter: '@djkevo_msa'
      },
      {
        userId: createdDJUsers[2].id,
        genres: ['House'],
        rating: 4.9,
        fans: 3200,
        bio: 'House music connoisseur with deep knowledge of electronic music evolution.',
        instagram: '@dj.leila',
        twitter: '@djleila_house'
      }
    ];

    const createdDJs = [];
    for (const djProfile of djProfiles) {
      const dj = await prisma.dj.create({
        data: djProfile,
      });
      createdDJs.push(dj);
    }

    console.log('✅ DJ profiles created');

    // Create sample club users
    const clubUsers = [
      {
        email: 'info@skylounge.co.ke',
        name: 'Sky Lounge Management',
        username: 'skylounge_nbi',
        bio: 'Upscale rooftop lounge with panoramic city views',
        location: 'Westlands, Nairobi'
      },
      {
        email: 'bookings@oceanview.co.ke',
        name: 'Ocean View Club',
        username: 'oceanview_msa',
        bio: 'Beachfront nightclub with world-class sound system',
        location: 'Nyali, Mombasa'
      },
      {
        email: 'events@rhythms.co.ke',
        name: 'Rhythms Nightclub',
        username: 'rhythms_kisumu',
        bio: 'The lakeside destination for the best nightlife experience',
        location: 'Kisumu City'
      }
    ];

    const createdClubUsers = [];
    for (const clubData of clubUsers) {
      const clubUser = await prisma.user.upsert({
        where: { email: clubData.email },
        update: {},
        create: {
          ...clubData,
          password: await bcrypt.hash('password123', 12),
          role: 'CLUB_OWNER',
        },
      });
      createdClubUsers.push(clubUser);
    }

    console.log('✅ Club users created');

    // Create club profiles
    const clubProfiles = [
      {
        userId: createdClubUsers[0].id,
        name: 'Sky Lounge Nairobi',
        location: 'Westlands, Nairobi',
        address: 'ABC Place, Waiyaki Way, Westlands',
        description: 'Experience Nairobi nightlife from 20 floors above the city. Sky Lounge offers premium drinks, gourmet food, and breathtaking views with the best DJs in town.',
        rating: 4.7,
        capacity: 200,
        dresscode: 'Smart Casual',
        amenities: ['VIP Section', 'Rooftop Terrace', 'Premium Bar', 'City Views', 'Valet Parking'],
        phone: '+254 711 123 456',
        website: 'https://skylounge.co.ke'
      },
      {
        userId: createdClubUsers[1].id,
        name: 'Ocean View Mombasa',
        location: 'Nyali, Mombasa',
        address: 'Links Road, Nyali Beach',
        description: 'Mombasa\'s premier beachfront nightclub. Dance under the stars with your feet in the sand to the rhythm of world-class DJs and the sound of ocean waves.',
        rating: 4.5,
        capacity: 300,
        dresscode: 'Beach Casual',
        amenities: ['Beach Access', 'Outdoor Dance Floor', 'Cocktail Bar', 'Ocean Views', 'Beach Volleyball'],
        phone: '+254 722 234 567',
        website: 'https://oceanview.co.ke'
      },
      {
        userId: createdClubUsers[2].id,
        name: 'Rhythms Kisumu',
        location: 'Kisumu City',
        address: 'Oginga Odinga Street, Kisumu',
        description: 'The heartbeat of Kisumu nightlife. Rhythms brings together the best of local and international music in a vibrant atmosphere overlooking Lake Victoria.',
        rating: 4.4,
        capacity: 250,
        dresscode: 'Smart Casual',
        amenities: ['Live Music Stage', 'Lakeside Terrace', 'Sports Bar', 'Lake Views', 'Private Booths'],
        phone: '+254 733 345 678',
        website: 'https://rhythms.co.ke'
      }
    ];

    const createdClubs = [];
    for (const clubProfile of clubProfiles) {
      const club = await prisma.club.create({
        data: clubProfile,
      });
      createdClubs.push(club);
    }

    console.log('✅ Club profiles created');

    // Create sample events
    const events = [
      {
        name: 'Amapiano Nights',
        date: new Date('2024-12-28T21:00:00Z'),
        clubId: createdClubs[0].id,
        djId: createdDJs[0].id,
      },
      {
        name: 'Afrobeats Beach Party',
        date: new Date('2024-12-29T20:00:00Z'),
        clubId: createdClubs[1].id,
        djId: createdDJs[1].id,
      },
      {
        name: 'House Music Lakeside',
        date: new Date('2024-12-30T22:00:00Z'),
        clubId: createdClubs[2].id,
        djId: createdDJs[2].id,
      },
      {
        name: 'New Year\'s Eve Spectacular',
        date: new Date('2024-12-31T20:00:00Z'),
        clubId: createdClubs[0].id,
        djId: createdDJs[2].id,
      }
    ];

    for (const event of events) {
      await prisma.event.create({
        data: event,
      });
    }

    console.log('✅ Sample events created');

    // Create sample regular users
    const regularUsers = [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        username: 'john_nightlife',
        bio: 'Music lover and nightlife enthusiast',
        location: 'Nairobi, Kenya'
      },
      {
        email: 'jane.smith@example.com',
        name: 'Jane Smith', 
        username: 'jane_party',
        bio: 'Dancing queen who loves good vibes',
        location: 'Mombasa, Kenya'
      }
    ];

    for (const userData of regularUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: await bcrypt.hash('password123', 12),
          role: 'USER',
        },
      });
    }

    console.log('✅ Regular users created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👑 Admin: admin@nightvibe.com / admin123');
    console.log('🎧 DJ Amara: dj.amara@example.com / password123');
    console.log('🎧 DJ Kevo: dj.kevo@example.com / password123');  
    console.log('🎧 DJ Leila: dj.leila@example.com / password123');
    console.log('🏢 Sky Lounge: info@skylounge.co.ke / password123');
    console.log('🏢 Ocean View: bookings@oceanview.co.ke / password123');
    console.log('🏢 Rhythms: events@rhythms.co.ke / password123');
    console.log('👤 John Doe: john.doe@example.com / password123');
    console.log('👤 Jane Smith: jane.smith@example.com / password123');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
