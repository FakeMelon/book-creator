import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { regeneratePageSchema } from "@/validators";
import { generatePageIllustration, dataUrlToBuffer } from "@/lib/image-gen";
import { uploadToR2, getPublicUrl, generateIllustrationKey } from "@/lib/r2";

const MAX_REGENERATION_ATTEMPTS = 3;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  const book = await db.book.findUnique({
    where: { id: bookId, userId: session.user.id },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { pageNumber } = regeneratePageSchema.parse({ bookId, ...body });

    const page = await db.bookPage.findUnique({
      where: { bookId_pageNumber: { bookId, pageNumber } },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (page.generationAttempt >= MAX_REGENERATION_ATTEMPTS) {
      return NextResponse.json(
        { error: `Maximum regeneration attempts (${MAX_REGENERATION_ATTEMPTS}) reached` },
        { status: 400 }
      );
    }

    if (!book.characterRefUrl || !page.illustrationPrompt) {
      return NextResponse.json({ error: "Missing character ref or prompt" }, { status: 400 });
    }

    // Generate new illustration
    const imageUrl = await generatePageIllustration(
      book.characterRefUrl,
      page.illustrationPrompt,
      book.illustrationStyle,
      pageNumber
    );

    const imgBuffer = dataUrlToBuffer(imageUrl);
    const key = generateIllustrationKey(bookId, pageNumber);
    await uploadToR2(key, imgBuffer, "image/png");
    const r2Url = getPublicUrl(key);

    // Update page
    const updated = await db.bookPage.update({
      where: { bookId_pageNumber: { bookId, pageNumber } },
      data: {
        illustrationUrl: r2Url,
        illustrationKey: key,
        generationAttempt: { increment: 1 },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json({ error: "Regeneration failed" }, { status: 500 });
  }
}
