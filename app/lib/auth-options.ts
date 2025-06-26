import { PrismaAdapter } from "@auth/prisma-adapter";
import { DefaultSession, NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type UserRole = 'USER' | 'DJ' | 'CLUB_OWNER' | 'ADMIN';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role?: UserRole;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  debug: false,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                role: 'USER' // Default role for Google sign-ins
              }
            },
          }),
        ] 
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing email or password');
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true
            }
          });

          if (!user || !user.password) {
            throw new Error('No user found with this email');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          // Log error in production but don't expose details
          if (process.env.NODE_ENV === 'production') {
            console.error('[Auth] Error:', error);
          }
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        
        // Fetch latest user data
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { 
            name: true,
            email: true,
            image: true,
            role: true
          }
        });
        
        if (user) {
          session.user.name = user.name;
          session.user.email = user.email;
          session.user.image = user.image;
          session.user.role = user.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      try {
        // If the URL contains localhost but we're in production, fix it
        if (url.includes('localhost') && baseUrl.includes('vercel.app')) {
          const urlObj = new URL(url);
          const callbackUrl = urlObj.searchParams.get('callbackUrl');
          if (callbackUrl) {
            const decodedCallback = decodeURIComponent(callbackUrl);
            const targetPath = new URL(decodedCallback).pathname;
            return `${baseUrl}${targetPath}`;
          }
        }

        // Handle relative URLs
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }

        // If URL is already using the correct base URL
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // Default fallback
        return `${baseUrl}/dashboard`;
      } catch (error) {
        return `${baseUrl}/dashboard`;
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};
