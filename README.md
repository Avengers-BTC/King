# NightVibe - Ultimate Nightlife Social Experience

NightVibe is a social platform connecting DJs, clubs, and nightlife enthusiasts. The application allows users to discover DJs, clubs, attend events, and share their nightlife experiences.

## Features

- **DJ Profiles**: Discover and follow popular DJs
- **Club Listings**: Find the best clubs and their upcoming events
- **Live Chat**: Chat with DJs and other fans during events
- **Moments**: Share your nightlife experiences with the community
- **Leaderboard**: See top-rated DJs and clubs
- **Responsive Design**: Fully responsive for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time Communication**: Socket.IO

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nightvibe.git
   cd nightvibe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your own values

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

- **Reset Database**: `npm run reset-db`
- **Prisma Studio**: `npx prisma studio`

## Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any other hosting service that supports Next.js.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ for the nightlife community
- UI design inspired by modern nightlife aesthetics
