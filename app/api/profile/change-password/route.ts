import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { changeUserPassword } from "@/lib/actions/profile";
import { authOptions } from "@/app/lib/auth-options";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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
    const result = await changeUserPassword(session.user.id, body);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Password change error:", error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to change password" },
      { status: 400 }
    );
  }
}
