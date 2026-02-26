import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generateCoverIllustration,
  generateBackCoverIllustration,
  dataUrlToBuffer,
} from "@/lib/image-gen";
import { uploadToR2, getPublicUrl, generateIllustrationKey } from "@/lib/r2";
import { THEMES } from "@/constants";
import type { GenerationStage, GenerationStatus } from "@prisma/client";

async function updateGenerationLog(
  bookId: string,
  stage: GenerationStage,
  status: GenerationStatus,
  message?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await db.generationLog.create({
      data: {
        bookId,
        stage,
        status,
        message,
        metadata: (metadata as any) || undefined,
        startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
        completedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
      },
    });
  } catch (err) {
    console.error(`Failed to write generation log [${stage}/${status}]:`, err);
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  try {
    const book = await db.book.findUnique({
      where: { id: bookId, userId: session.user.id },
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Book must be in DRAFT status to generate covers" },
        { status: 400 }
      );
    }

    await db.book.update({
      where: { id: bookId },
      data: { status: "GENERATING", generationStartedAt: new Date(), generationError: null },
    });

    const themeConfig = THEMES.find((t) => t.id === book.theme);
    const title = book.title || "My Story Book";
    const photoUrl = book.childPhotoUrl || "";

    // Build cover scene description from book data
    const coverScene = `A vibrant children's book cover. The main character is ${book.childName}, age ${book.childAge}. The theme is ${themeConfig?.name || book.theme} — ${themeConfig?.storyPromptHint || ""}. The scene should be inviting, magical, and capture the essence of the story.`;

    const backCoverMotif = themeConfig?.name
      ? `${themeConfig.name.toLowerCase()}-themed decorative elements`
      : "stars and magical swirls";

    // Front Cover
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

    // Back Cover
    await updateGenerationLog(bookId, "BACK_COVER", "IN_PROGRESS", "Creating back cover...");

    try {
      const backCoverDataUrl = await generateBackCoverIllustration(
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

    await db.book.update({
      where: { id: bookId },
      data: { status: "COVER_READY" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cover generation error:", error);

    try {
      await db.book.update({
        where: { id: bookId },
        data: {
          status: "DRAFT",
          generationError: String(error),
        },
      });
    } catch (updateError) {
      console.error("Failed to reset book status after cover generation error:", updateError);
    }

    return NextResponse.json({ error: "Cover generation failed" }, { status: 500 });
  }
}
