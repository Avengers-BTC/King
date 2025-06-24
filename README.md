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

### Vercel Deployment

1. Push your code to GitHub.

2. Connect your repository to Vercel:
   - Create a new project in Vercel
   - Select your GitHub repository
   - Configure the following settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

3. Configure Environment Variables in Vercel:
   - Go to the project settings
   - Add all the environment variables from `.env.example`
   - Ensure the `NEXT_PUBLIC_APP_URL` matches your Vercel deployment URL
   - Set `NEXT_PUBLIC_SOCKET_SERVER` to your Socket.IO server URL (e.g., on Render)

4. Deploy:
   - Trigger a new deployment by pushing to your repository
   - Vercel will automatically build and deploy your application

### Socket.IO Server Deployment (Render)

The Socket.IO server is deployed separately on Render:

1. Push your code to GitHub.

2. Create a new Web Service in Render:
   - Connect to your GitHub repository
   - Configure the following settings:
     - Build Command: `cd socket-server && npm install`
     - Start Command: `cd socket-server && npm start`
   - Add the following environment variables:
     - `NODE_ENV`: `production`
     - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL

3. Deploy and note the Render URL.

4. Update your Vercel environment variables:
   - Set `NEXT_PUBLIC_SOCKET_SERVER` to the Render URL

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
