import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

const supportedLocales = routing.locales as readonly [string, ...string[]];

const schema = z.object({
  locale: z.enum(supportedLocales, { message: "Unsupported locale" }),
});

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { locale } = schema.parse(body);

    await db.user.update({
      where: { id: session.user.id },
      data: { locale },
    });

    return NextResponse.json({ locale });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Failed to update user locale:", error);
    return NextResponse.json({ error: "Failed to update language preference" }, { status: 500 });
  }
}
