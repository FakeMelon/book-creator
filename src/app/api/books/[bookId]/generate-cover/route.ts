import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateCoverIllustration,
  generateBackCoverIllustration,
  dataUrlToBuffer,
} from "@/lib/image-gen";
import { uploadToR2, getPublicUrl, generateIllustrationKey } from "@/lib/r2";
import { THEMES } from "@/constants";

async function updateGenerationLog(
  bookId: string,
  stage: string,
  status: string,
  message?: string,
  metadata?: Record<string, unknown>
) {
  await db.generationLog.create({
    data: {
      bookId,
      stage: stage as any,
      status: status as any,
      message,
      metadata: (metadata as any) || undefined,
      startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  try {
    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Book must be in DRAFT status to generate covers" },
        { status: 400 }
      );
    }

    // Set status to GENERATING
    await db.book.update({
      where: { id: bookId },
      data: { status: "GENERATING", generationStartedAt: new Date(), generationError: null },
    });

    const themeConfig = THEMES.find((t) => t.id === book.theme);
    const title = book.title || "My Story Book";
    const photoUrl = book.childPhotoUrl || "";

    // Build cover scene description from book data (same approach as demo)
    const coverScene = `A vibrant children's book cover. The main character is ${book.childName}, age ${book.childAge}. The theme is ${themeConfig?.name || book.theme} — ${themeConfig?.storyPromptHint || ""}. The scene should be inviting, magical, and capture the essence of the story.`;

    const backCoverMotif = themeConfig?.name
      ? `${themeConfig.name.toLowerCase()}-themed decorative elements`
      : "stars and magical swirls";

    // Stage 1: Front Cover
    await updateGenerationLog(bookId, "FRONT_COVER", "IN_PROGRESS", "Creating front cover...");

    try {
      const coverDataUrl = await generateCoverIllustration(
        photoUrl,
        title,
        coverScene,
        book.illustrationStyle
      );

      const coverBuffer = dataUrlToBuffer(coverDataUrl);
      const coverKey = generateIllustrationKey(bookId, 1);
      await uploadToR2(coverKey, coverBuffer, "image/png");
      const coverR2Url = getPublicUrl(coverKey);

      await db.book.update({
        where: { id: bookId },
        data: { coverImageUrl: coverR2Url, coverImageKey: coverKey },
      });

      await updateGenerationLog(bookId, "FRONT_COVER", "COMPLETED", "Front cover done!", {
        thumbnailUrl: coverR2Url,
      });
    } catch (error) {
      await updateGenerationLog(bookId, "FRONT_COVER", "FAILED", String(error));
      throw error;
    }

    // Stage 2: Back Cover
    await updateGenerationLog(bookId, "BACK_COVER", "IN_PROGRESS", "Creating back cover...");

    try {
      const backCoverDataUrl = await generateBackCoverIllustration(
        photoUrl,
        backCoverMotif,
        book.illustrationStyle
      );

      const backCoverBuffer = dataUrlToBuffer(backCoverDataUrl);
      const backCoverKey = generateIllustrationKey(bookId, 32);
      await uploadToR2(backCoverKey, backCoverBuffer, "image/png");
      const backCoverR2Url = getPublicUrl(backCoverKey);

      await db.book.update({
        where: { id: bookId },
        data: { backCoverImageUrl: backCoverR2Url, backCoverImageKey: backCoverKey },
      });

      await updateGenerationLog(bookId, "BACK_COVER", "COMPLETED", "Back cover done!");
    } catch (error) {
      await updateGenerationLog(bookId, "BACK_COVER", "FAILED", String(error));
      throw error;
    }

    // Set status to COVER_READY
    await db.book.update({
      where: { id: bookId },
      data: { status: "COVER_READY" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cover generation error:", error);

    await db.book.update({
      where: { id: bookId },
      data: {
        status: "DRAFT",
        generationError: String(error),
      },
    });

    return NextResponse.json({ error: "Cover generation failed" }, { status: 500 });
  }
}
