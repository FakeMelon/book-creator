import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastLogCount = 0;
      let completed = false;

      const sendEvent = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Poll for updates every 2 seconds
      const interval = setInterval(async () => {
        try {
          const book = await db.book.findUnique({
            where: { id: bookId },
            select: { status: true, title: true },
          });

          if (!book) {
            sendEvent({ type: "error", message: "Book not found" });
            clearInterval(interval);
            controller.close();
            return;
          }

          // Get new generation logs
          const logs = await db.generationLog.findMany({
            where: { bookId },
            orderBy: { createdAt: "asc" },
          });

          // Send new logs
          for (let i = lastLogCount; i < logs.length; i++) {
            const log = logs[i];
            const stageIndex = [
              "STORY_GENERATION",
              "SAFETY_REVIEW",
              "CHARACTER_DESIGN",
              "COVER_ILLUSTRATIONS",
              "PAGE_ILLUSTRATIONS",
              "PDF_ASSEMBLY",
              "QUALITY_CHECK",
            ].indexOf(log.stage);

            const progress = Math.min(
              Math.round(((stageIndex + (log.status === "COMPLETED" ? 1 : 0.5)) / 7) * 100),
              100
            );

            sendEvent({
              type: "progress",
              stage: log.stage,
              status: log.status,
              message: log.message,
              progress,
              metadata: log.metadata,
            });
          }
          lastLogCount = logs.length;

          // Check if completed
          if ((book.status === "PREVIEW_READY" || book.status === "COVER_READY") && !completed) {
            completed = true;
            sendEvent({
              type: "complete",
              bookId,
              title: book.title,
              message: "Your book is ready!",
            });
            clearInterval(interval);
            controller.close();
          }

          // Check for errors
          if (book.status === "DRAFT" && logs.some((l) => l.status === "FAILED")) {
            sendEvent({
              type: "error",
              message: "Generation failed. Please try again.",
            });
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error("SSE polling error:", error);
        }
      }, 2000);

      // Send initial event
      sendEvent({ type: "connected", bookId });

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
