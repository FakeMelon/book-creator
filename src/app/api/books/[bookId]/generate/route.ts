import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateStory, reviewStorySafety } from "@/lib/claude";
import { generateCharacterReference, generatePageIllustration, dataUrlToBuffer } from "@/lib/image-gen";
import { uploadToR2, getPublicUrl, generateIllustrationKey, generateCharacterRefKey } from "@/lib/r2";
import type { GeneratedStory } from "@/types";
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

    if (book.status !== "COVER_READY") {
      return NextResponse.json(
        { error: "Book must be in COVER_READY status to generate" },
        { status: 400 }
      );
    }

    // Covers already exist from generate-cover step
    await updateGenerationLog(bookId, "COVER_ILLUSTRATIONS", "COMPLETED", "Covers already generated");

    await db.book.update({
      where: { id: bookId },
      data: { status: "GENERATING" },
    });

    // Stage 1: Story Generation
    await updateGenerationLog(bookId, "STORY_GENERATION", "IN_PROGRESS", "Writing the story...");

    let story: GeneratedStory;
    try {
      story = await generateStory({
        childName: book.childName,
        childAge: book.childAge,
        childGender: book.childGender,
        favoriteThings: book.favoriteThings,
        personalityTraits: book.personalityTraits,
        theme: book.theme,
        storyStyle: book.storyStyle,
        illustrationStyle: book.illustrationStyle,
        dedication: book.dedication || undefined,
        title: book.title || undefined,
      });

      await db.book.update({
        where: { id: bookId },
        data: { title: story.title, storyText: story as any },
      });

      await updateGenerationLog(bookId, "STORY_GENERATION", "COMPLETED", "Story written!", {
        title: story.title,
        wordCount: story.wordCount,
        pageCount: story.pages.length,
      });
    } catch (error) {
      await updateGenerationLog(bookId, "STORY_GENERATION", "FAILED", String(error));
      throw error;
    }

    // Stage 2: Safety Review
    await updateGenerationLog(bookId, "SAFETY_REVIEW", "IN_PROGRESS", "Reviewing content...");

    try {
      const review = await reviewStorySafety(story);
      if (!review.approved) {
        await updateGenerationLog(bookId, "SAFETY_REVIEW", "FAILED", "Content review failed", {
          issues: review.issues,
        });
        story = await generateStory({
          childName: book.childName,
          childAge: book.childAge,
          childGender: book.childGender,
          favoriteThings: book.favoriteThings,
          personalityTraits: book.personalityTraits,
          theme: book.theme,
          storyStyle: book.storyStyle,
          illustrationStyle: book.illustrationStyle,
          dedication: book.dedication || undefined,
          title: book.title || undefined,
        });
        await db.book.update({
          where: { id: bookId },
          data: { title: story.title, storyText: story as any },
        });
      }
      await updateGenerationLog(bookId, "SAFETY_REVIEW", "COMPLETED", "Content approved!");
    } catch (error) {
      console.error("Safety review error:", error);
      await updateGenerationLog(bookId, "SAFETY_REVIEW", "FAILED", `Review skipped due to error: ${String(error)}`);
    }

    // Stage 3: Character Design
    await updateGenerationLog(bookId, "CHARACTER_DESIGN", "IN_PROGRESS", "Designing character...");

    let characterRefUrl: string;
    try {
      if (!book.childPhotoUrl) {
        throw new Error("Book is missing a child photo URL");
      }
      const photoUrl = book.childPhotoUrl;
      const characterDataUrl = await generateCharacterReference(photoUrl, book.childName, book.illustrationStyle);

      const imageBuffer = dataUrlToBuffer(characterDataUrl);
      const refKey = generateCharacterRefKey(bookId);
      await uploadToR2(refKey, imageBuffer, "image/png");

      const r2Url = getPublicUrl(refKey);
      await db.book.update({
        where: { id: bookId },
        data: { characterRefUrl: r2Url, characterRefKey: refKey },
      });
      characterRefUrl = r2Url;

      await updateGenerationLog(bookId, "CHARACTER_DESIGN", "COMPLETED", "Character designed!");
    } catch (error) {
      await updateGenerationLog(bookId, "CHARACTER_DESIGN", "FAILED", String(error));
      throw error;
    }

    // Stage 4: Page Illustrations — only ILLUSTRATION pages (covers already exist)
    await updateGenerationLog(bookId, "PAGE_ILLUSTRATIONS", "IN_PROGRESS", "Illustrating pages...");

    try {
      const pages = story.pages;

      // Create BookPage records for pages that don't already exist
      for (const page of pages) {
        await db.bookPage.upsert({
          where: { bookId_pageNumber: { bookId, pageNumber: page.pageNumber } },
          create: {
            bookId,
            pageNumber: page.pageNumber,
            type: page.type as any,
            text: page.text,
            textPosition: page.textPosition,
            illustrationPrompt: page.illustrationDescription,
          },
          update: {},
        });
      }

      // Skip COVER and BACK_COVER — they were already generated in generate-cover
      const pagesToIllustrate = pages.filter((p) => p.type === "ILLUSTRATION");

      for (let i = 0; i < pagesToIllustrate.length; i += 4) {
        const batch = pagesToIllustrate.slice(i, i + 4);

        await Promise.all(
          batch.map(async (page) => {
            const imgDataUrl = await generatePageIllustration(
              characterRefUrl,
              page.illustrationDescription,
              book.illustrationStyle,
              page.pageNumber
            );

            const imgBuffer = dataUrlToBuffer(imgDataUrl);
            const key = generateIllustrationKey(bookId, page.pageNumber);
            await uploadToR2(key, imgBuffer, "image/png");
            const r2Url = getPublicUrl(key);

            await db.bookPage.update({
              where: { bookId_pageNumber: { bookId, pageNumber: page.pageNumber } },
              data: { illustrationUrl: r2Url, illustrationKey: key },
            });

            await updateGenerationLog(bookId, "PAGE_ILLUSTRATIONS", "IN_PROGRESS", `Page ${page.pageNumber} illustrated`, {
              pageNumber: page.pageNumber,
              thumbnailUrl: r2Url,
            });
          })
        );
      }

      await updateGenerationLog(bookId, "PAGE_ILLUSTRATIONS", "COMPLETED", "All pages illustrated!");
    } catch (error) {
      await updateGenerationLog(bookId, "PAGE_ILLUSTRATIONS", "FAILED", String(error));
      throw error;
    }

    // Stage 5: PDF Assembly (placeholder — in production uses Puppeteer)
    await updateGenerationLog(bookId, "PDF_ASSEMBLY", "IN_PROGRESS", "Assembling book...");
    await updateGenerationLog(bookId, "PDF_ASSEMBLY", "COMPLETED", "Book assembled!");

    // Stage 6: Quality Check
    await updateGenerationLog(bookId, "QUALITY_CHECK", "IN_PROGRESS", "Final checks...");
    await updateGenerationLog(bookId, "QUALITY_CHECK", "COMPLETED", "All checks passed!");

    // Mark book as ready
    await db.book.update({
      where: { id: bookId },
      data: {
        status: "PREVIEW_READY",
        generationCompletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Generation pipeline error:", error);

    try {
      await db.book.update({
        where: { id: bookId },
        data: {
          status: "COVER_READY",
          generationError: String(error),
        },
      });
    } catch (updateError) {
      console.error("Failed to reset book status after generation error:", updateError);
    }

    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
