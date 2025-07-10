import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

// Schema for forgot password request
const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    try {
      // Store token in database
      await (prisma as any).passwordReset.upsert({
        where: { userId: user.id },
        update: {
          token: resetToken,
          expires: resetTokenExpiry,
        },
        create: {
          userId: user.id,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      });
    } catch (error) {
      console.error("Error storing password reset token:", error);
      // Continue anyway to test email functionality
    }

    // Generate email content
    const { subject, html } = generatePasswordResetEmail(
      resetToken,
      user.name || 'User'
    );

    // Send password reset email
    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
    });

    // In development, return additional information
    if (process.env.NODE_ENV === "development") {
      const response: any = {
        message: "If an account with that email exists, a password reset link has been sent.",
        success: emailResult.success
      };
      
      // Include the reset link and token for testing
      response.resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      response.token = resetToken;
      
      // Include preview URL if available
      if (emailResult.previewUrl) {
        response.emailPreviewUrl = emailResult.previewUrl;
      }
      
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
