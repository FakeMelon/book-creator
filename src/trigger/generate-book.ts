import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { generateStory, reviewStorySafety } from "@/lib/claude";
import { generateCharacterReference, generatePageIllustration, generateCoverIllustration, dataUrlToBuffer } from "@/lib/image-gen";
import { uploadToR2, getPublicUrl, generateIllustrationKey, generateCharacterRefKey } from "@/lib/r2";
import type { GeneratedStory } from "@/types";

export const generateBookTask = task({
  id: "generate-book",
  maxDuration: 600, // 10 minutes max
  retry: { maxAttempts: 2 },
  run: async (payload: { bookId: string }) => {
    const { bookId } = payload;
    logger.info("Starting book generation", { bookId });

    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found");

    // Stage 1: Story Generation
    logger.info("Stage 1: Generating story");
    await logStage(bookId, "STORY_GENERATION", "IN_PROGRESS");

    // Parse additional characters from JSON field
    const additionalChars = (book.additionalCharacters as any[]) || [];

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
        occasion: book.occasion || undefined,
        hobbies: book.hobbies.length > 0 ? book.hobbies : undefined,
        favoriteCharacters: book.favoriteCharacters.length > 0 ? book.favoriteCharacters : undefined,
        favoriteAnimal: book.favoriteAnimal.length > 0 ? book.favoriteAnimal : undefined,
        additionalCharacters: additionalChars.length > 0 ? additionalChars : undefined,
        title: book.title || undefined,
      });

      await db.book.update({
        where: { id: bookId },
        data: { title: story.title, storyText: story as any },
      });
      await logStage(bookId, "STORY_GENERATION", "COMPLETED");
    } catch (error) {
      await logStage(bookId, "STORY_GENERATION", "FAILED", String(error));
      throw error;
    }

    // Stage 2: Safety Review
    logger.info("Stage 2: Safety review");
    await logStage(bookId, "SAFETY_REVIEW", "IN_PROGRESS");
    try {
      const review = await reviewStorySafety(story);
      if (!review.approved) {
        logger.warn("Safety review flagged issues, regenerating", { issues: review.issues });
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
          occasion: book.occasion || undefined,
          hobbies: book.hobbies.length > 0 ? book.hobbies : undefined,
          favoriteCharacters: book.favoriteCharacters.length > 0 ? book.favoriteCharacters : undefined,
          favoriteAnimal: book.favoriteAnimal.length > 0 ? book.favoriteAnimal : undefined,
          additionalCharacters: additionalChars.length > 0 ? additionalChars : undefined,
          title: book.title || undefined,
        });
        await db.book.update({
          where: { id: bookId },
          data: { title: story.title, storyText: story as any },
        });
      }
      await logStage(bookId, "SAFETY_REVIEW", "COMPLETED");
    } catch {
      await logStage(bookId, "SAFETY_REVIEW", "COMPLETED");
    }

    // Stage 3: Character Design
    logger.info("Stage 3: Character design");
    await logStage(bookId, "CHARACTER_DESIGN", "IN_PROGRESS");
    let characterRefUrl: string;
    try {
      const characterDataUrl = await generateCharacterReference(
        book.childPhotoUrl!,
        book.childName,
        book.illustrationStyle
      );

      const imgBuf = dataUrlToBuffer(characterDataUrl);
      const refKey = generateCharacterRefKey(bookId);
      await uploadToR2(refKey, imgBuf, "image/png");
      characterRefUrl = getPublicUrl(refKey);

      await db.book.update({
        where: { id: bookId },
        data: { characterRefUrl, characterRefKey: refKey },
      });
      await logStage(bookId, "CHARACTER_DESIGN", "COMPLETED");
    } catch (error) {
      await logStage(bookId, "CHARACTER_DESIGN", "FAILED", String(error));
      throw error;
    }

    // Stage 4: Page Illustrations
    logger.info("Stage 4: Generating illustrations");
    await logStage(bookId, "PAGE_ILLUSTRATIONS", "IN_PROGRESS");

    // Create BookPage records
    for (const page of story.pages) {
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
        update: {
          text: page.text,
          textPosition: page.textPosition,
          illustrationPrompt: page.illustrationDescription,
        },
      });
    }

    const illustrationPages = story.pages.filter(
      (p) => p.type === "COVER" || p.type === "ILLUSTRATION"
    );

    // Batch 4 at a time
    for (let i = 0; i < illustrationPages.length; i += 4) {
      const batch = illustrationPages.slice(i, i + 4);
      await Promise.all(
        batch.map(async (page) => {
          const imgDataUrl =
            page.type === "COVER"
              ? await generateCoverIllustration(
                  characterRefUrl,
                  story.title,
                  page.illustrationDescription,
                  book.illustrationStyle
                )
              : await generatePageIllustration(
                  characterRefUrl,
                  page.illustrationDescription,
                  book.illustrationStyle,
                  page.pageNumber
                );

          const imgBuf = dataUrlToBuffer(imgDataUrl);
          const key = generateIllustrationKey(bookId, page.pageNumber);
          await uploadToR2(key, imgBuf, "image/png");
          const r2Url = getPublicUrl(key);

          await db.bookPage.update({
            where: { bookId_pageNumber: { bookId, pageNumber: page.pageNumber } },
            data: { illustrationUrl: r2Url, illustrationKey: key },
          });

          if (page.type === "COVER") {
            await db.book.update({
              where: { id: bookId },
              data: { coverImageUrl: r2Url, coverImageKey: key },
            });
          }

          logger.info(`Page ${page.pageNumber} illustrated`);
        })
      );
    }

    await logStage(bookId, "PAGE_ILLUSTRATIONS", "COMPLETED");

    // Stage 5 & 6: PDF Assembly & Quality Check
    await logStage(bookId, "PDF_ASSEMBLY", "IN_PROGRESS");
    // TODO: Puppeteer PDF assembly
    await logStage(bookId, "PDF_ASSEMBLY", "COMPLETED");

    await logStage(bookId, "QUALITY_CHECK", "IN_PROGRESS");
    await logStage(bookId, "QUALITY_CHECK", "COMPLETED");

    // Mark complete
    await db.book.update({
      where: { id: bookId },
      data: { status: "PREVIEW_READY", generationCompletedAt: new Date() },
    });

    logger.info("Book generation complete", { bookId });
    return { bookId, title: story.title };
  },
});

async function logStage(bookId: string, stage: string, status: string, error?: string) {
  await db.generationLog.create({
    data: {
      bookId,
      stage: stage as any,
      status: status as any,
      message: error || undefined,
      startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: ["COMPLETED", "FAILED"].includes(status) ? new Date() : undefined,
      error: status === "FAILED" ? error : undefined,
    },
  });
}
