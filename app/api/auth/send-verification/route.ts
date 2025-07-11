import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/actions/password-reset";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await sendVerificationEmail(userId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Send verification email error:", error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send verification email" },
      { status: 500 }
    );
  }
}
