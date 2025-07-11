import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateUserProfile } from "@/lib/actions/profile";
import { authOptions } from "@/app/lib/auth-options";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updatedUser = await updateUserProfile(session.user.id, body);
    
    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 400 }
    );
  }
}
