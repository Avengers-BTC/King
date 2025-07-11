import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/actions/password-reset";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Email verification error:", error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Email verification failed" },
      { status: 500 }
    );
  }
}
