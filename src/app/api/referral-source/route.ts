import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  referralSource: z.string().trim().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralSource } = schema.parse(body);

    const session = await auth();
    if (!session?.user?.id) {
      // Not authenticated — return 200 without persisting.
      // The client stores it in the Zustand wizard store regardless.
      // Intentionally not 401 because this is also called from guest onboarding.
      return NextResponse.json({ stored: false });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { referralSource },
    });

    return NextResponse.json({ stored: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Failed to save referral source:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
