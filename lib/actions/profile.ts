import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Schema for basic profile update
const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  location: z.string().max(100, "Location cannot exceed 100 characters").optional(),
});

// Schema for password change
const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// Type for profile update input
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// Type for password change input
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;

/**
 * Update user profile information
 * @param userId The user's ID
 * @param data Profile data to update
 * @returns Updated user object (without password)
 */
export async function updateUserProfile(userId: string, data: ProfileUpdateInput) {
  try {
    // Validate input
    const validatedData = ProfileUpdateSchema.parse(data);

    // Check if username is being updated and if it's already taken
    if (validatedData.username) {
      const existingUser = await prisma.user.findUnique({
        where: {
          username: validatedData.username,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        throw new Error("Username is already taken");
      }
    }

    // Update user profile
    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}

/**
 * Change user password
 * @param userId The user's ID
 * @param data Object containing current password and new password
 * @returns Success message
 */
export async function changeUserPassword(userId: string, data: PasswordChangeInput) {
  try {
    // Validate input
    const validatedData = PasswordChangeSchema.parse(data);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}
