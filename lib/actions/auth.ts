import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  username: z.string().optional(),
  location: z.string().optional(),
});

export type UserInput = z.infer<typeof UserSchema>;

export async function registerUser(data: UserInput) {
  try {
    // Validate input
    const validatedData = UserSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check if username is taken (if provided)
    if (validatedData.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUsername) {
        throw new Error("Username is already taken");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with all required fields properly initialized
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        username: validatedData.username || `user_${Date.now()}`, // Generate a default username if not provided
        location: validatedData.location,
        bio: "", // Initialize with empty string
        followers: 0,
        following: 0,
        role: "USER", // Default role
        joinDate: new Date(), // Explicit join date
        image: null, // No initial profile image
      },
    });

    // Remove sensitive data from returned user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}

export async function updateUserRole(userId: string, role: "USER" | "DJ" | "CLUB_OWNER" | "ADMIN") {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error("Failed to update user role");
  }
}
