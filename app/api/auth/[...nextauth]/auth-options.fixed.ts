import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    providers: [
        // Google OAuth provider with improved configuration
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
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            
            // For Google Auth, ensure user exists in database
            if (account?.provider === 'google' && profile?.email) {
                try {
                    // Check if the user exists
                    let dbUser = await prisma.user.findUnique({
                        where: { email: profile.email }
                    });
                    
                    // If not, create a new user
                    if (!dbUser) {
                        dbUser = await prisma.user.create({
                            data: {
                                email: profile.email,
                                name: profile.name || profile.email.split('@')[0],
                                image: (profile as any).picture || null,
                                role: 'USER',
                            }
                        });
                    }
                    
                    // Update token with the user ID and role
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                } catch (error) {
                    console.error("Failed to create/find user:", error);
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string || token.sub as string;
                session.user.role = token.role as UserRole;
            }
            return session;
        }
    }
};
