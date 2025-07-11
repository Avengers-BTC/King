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
      username?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role?: UserRole;
    username?: string | null;
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
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          if (!user || !user.password) {
            return null;
          }
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          return false;
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email }
        });
        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              image: profile.image,
              role: 'USER',
            }
          });
        }
      }
      return true;
    }
  }
};
