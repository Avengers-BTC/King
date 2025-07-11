import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            
            // For Google Auth, ensure token has correct information
            if (account?.provider === 'google' && profile?.email) {
                try {
                    // Check if the user exists
                    const dbUser = await prisma.user.findUnique({
                        where: { email: profile.email }
                    });
                    
                    if (dbUser) {
                        // Update token with the user ID and role
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                    }
                } catch (error) {
                    console.error("[next-auth] JWT callback error:", error);
                }
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
            // For Google sign-ins, ensure we create a user in our database
            if (account?.provider === 'google' && profile?.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: profile.email }
                    });
                    
                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                id: user.id, // Use the ID provided by NextAuth
                                email: profile.email,
                                name: profile.name || profile.email.split('@')[0],
                                image: (profile as any).picture || null,
                                role: 'USER',
                            }
                        });
                    }
                } catch (error) {
                    console.error("[next-auth] SignIn callback error:", error);
                    // Continue auth flow even if user creation fails
                }
            }
            
            return true;
        }
    },
    providers: [
        // Google OAuth provider
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
        
        // Credentials provider for email/password authentication
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
    ]
};
