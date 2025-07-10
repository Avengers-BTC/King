import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

// Schemas for validation
const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Type for forgot password input
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// Type for reset password input
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// Type for verify email input
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

/**
 * Request a password reset
 * @param email The user's email address
 * @returns Object with success status and message
 */
export async function requestPasswordReset(email: string) {
  try {
    // Validate email
    const { email: validatedEmail } = ForgotPasswordSchema.parse({ email });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    // If no user found, return early but don't reveal this information
    if (!user) {
      return { 
        success: true, 
        message: "If an account with that email exists, a password reset link has been sent." 
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // TODO: Once PasswordReset model is properly migrated to the database, uncomment this code
    // await prisma.passwordReset.upsert({
    //   where: { userId: user.id },
    //   update: {
    //     token: resetToken,
    //     expires: resetTokenExpiry,
    //   },
    //   create: {
    //     userId: user.id,
    //     token: resetToken,
    //     expires: resetTokenExpiry,
    //   },
    // });

    // In a real implementation, you would send an email with the reset link
    // For development, just return the token
    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        message: "Password reset email sent",
        resetLink: `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
        token: resetToken, // Only include in development
      };
    }

    return {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to process password reset request");
  }
}

/**
 * Reset user password with token
 * @param data Object containing reset token and new password
 * @returns Object with success status and message
 */
export async function resetPassword(data: ResetPasswordInput) {
  try {
    // Validate input
    const validatedData = ResetPasswordSchema.parse(data);

    // TODO: Once PasswordReset model is properly migrated to the database, uncomment this code
    // const passwordReset = await prisma.passwordReset.findUnique({
    //   where: { token: validatedData.token },
    //   include: { user: true },
    // });
    // 
    // if (!passwordReset) {
    //   throw new Error("Invalid or expired password reset token");
    // }
    // 
    // if (passwordReset.expires < new Date()) {
    //   await prisma.passwordReset.delete({
    //     where: { id: passwordReset.id },
    //   });
    //   throw new Error("Password reset token has expired");
    // }
    
    // For now, we'll simulate token validation
    // In production, you would:
    // 1. Find the token in the database
    // 2. Check if it's expired
    // 3. Find the associated user
    // 4. Update their password
    // 5. Delete the used token

    // This is a placeholder for the actual implementation
    const mockValidToken = validatedData.token.length > 10;
    
    if (!mockValidToken) {
      throw new Error("Invalid or expired password reset token");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // In a real implementation, update the user's password in the database
    // For now, just log it
    console.log(`Password reset successful. New hashed password: ${hashedPassword.substring(0, 10)}...`);

    return {
      success: true,
      message: "Your password has been reset successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}

/**
 * Send email verification link
 * @param userId The user's ID
 * @returns Object with success status and message
 */
export async function sendVerificationEmail(userId: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: "Email is already verified",
      };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 3600000), // 24 hours
      },
    });

    // In a real implementation, send email with verification link
    // For development, just return the token
    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        message: "Verification email sent",
        verificationLink: `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`,
        token: verificationToken, // Only include in development
      };
    }

    return {
      success: true,
      message: "Verification email sent",
    };
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
}

/**
 * Verify user's email with token
 * @param token The verification token
 * @returns Object with success status and message
 */
export async function verifyEmail(token: string) {
  try {
    // Validate token
    const { token: validatedToken } = VerifyEmailSchema.parse({ token });

    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: validatedToken },
    });

    if (!verificationToken) {
      throw new Error("Invalid or expired verification token");
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token: validatedToken },
      });
      throw new Error("Verification token has expired");
    }

    // Update user email verification status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token: validatedToken },
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
}
