import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  referralSource: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralSource } = schema.parse(body);

    const session = await auth();
    if (!session?.user?.id) {
      // Not authenticated — client stores it locally for now
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
