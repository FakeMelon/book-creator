"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { WizardProgressBar } from "@/components/wizard/progress-bar";
import { WizardSteps } from "@/components/wizard/wizard-steps";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookViewer } from "@/components/book-preview/book-viewer";
import { cn } from "@/lib/utils";
import type { BookPageView } from "@/types";

type DemoPhase = "wizard" | "generating" | "preview";

interface ImageProgress {
  stage: "character-ref" | "illustrations" | "done";
  done: number;
  total: number;
}

export default function DemoPage() {
  const step = useWizardStore((s) => s.step);
  const [phase, setPhase] = useState<DemoPhase>("wizard");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedPages, setGeneratedPages] = useState<BookPageView[]>([]);
  const [genProgress, setGenProgress] = useState("");
  const [error, setError] = useState("");
  const [imageProgress, setImageProgress] = useState<ImageProgress | null>(null);
  const [maxImages, setMaxImages] = useState<number>(0); // 0 = all

  const abortRef = useRef<AbortController | null>(null);

  // Reset wizard store on mount so demo always starts fresh
  useEffect(() => {
    useWizardStore.getState().reset();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ─── Demo Photo Upload Handler ───

  async function demoUploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch("/api/demo/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const { filename } = await res.json();
    return filename; // stored as photoKey in wizard store
  }

  // ─── Start Over ───

  function handleStartOver() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("wizard");
    useWizardStore.getState().reset();
    setGeneratedTitle("");
    setGeneratedPages([]);
    setGenProgress("");
    setError("");
    setImageProgress(null);
    setMaxImages(0);
  }

  // ─── Image Generation (runs in background after story preview) ───

  async function generateImages(
    storyData: { title: string; pages: Array<{ pageNumber: number; type: string; illustrationDescription: string }> },
    signal: AbortSignal
  ) {
    const { photoKey, childName, illustrationStyle } = useWizardStore.getState();

    const allIllustrationPages = storyData.pages.filter(
      (p) => p.type === "COVER" || p.type === "ILLUSTRATION"
    );

    // Apply max images limit (0 = generate all)
    const illustrationPages = maxImages > 0
      ? allIllustrationPages.slice(0, maxImages)
      : allIllustrationPages;

    const total = illustrationPages.length;

    // Phase 1: Character reference (if photo was uploaded)
    let characterRefId: string | null = null;

    if (photoKey) {
      setImageProgress({ stage: "character-ref", done: 0, total });

      try {
        const res = await fetch("/api/demo/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "character-ref",
            photoId: photoKey.replace(/\.[^.]+$/, ""), // strip extension
            photoFilename: photoKey,
            childName,
            illustrationStyle,
          }),
          signal,
        });

        if (res.ok) {
          const data = await res.json();
          characterRefId = data.characterRefId;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Character ref generation failed:", err);
      }
    }

    // Phase 2: Page illustrations in batches of 3
    setImageProgress({ stage: "illustrations", done: 0, total });
    const BATCH_SIZE = 3;

    for (let i = 0; i < illustrationPages.length; i += BATCH_SIZE) {
      if (signal.aborted) return;

      const batch = illustrationPages.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (page) => {
          const res = await fetch("/api/demo/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "illustration",
              characterRefId,
              sceneDescription: page.illustrationDescription,
              illustrationStyle,
              pageNumber: page.pageNumber,
              pageType: page.type,
              bookTitle: storyData.title,
            }),
            signal,
          });

          if (!res.ok) throw new Error(`Failed for page ${page.pageNumber}`);
          return res.json();
        })
      );

      // Update pages with completed images
      for (const result of results) {
        if (result.status === "fulfilled") {
          const { pageNumber, imageDataUrl } = result.value;
          setGeneratedPages((prev) =>
            prev.map((p) =>
              p.pageNumber === pageNumber ? { ...p, illustrationUrl: imageDataUrl } : p
            )
          );
        }
      }

      const done = Math.min(i + BATCH_SIZE, illustrationPages.length);
      setImageProgress({ stage: "illustrations", done, total });
    }

    setImageProgress({ stage: "done", done: total, total });
  }

  // ─── Main Generation Flow (called from StepReview via onSubmit) ───

  function handleGenerate() {
    setPhase("generating");
    setGenProgress("Sending to Claude...");
    setError("");
    setImageProgress(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const store = useWizardStore.getState();

    fetch("/api/demo/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childName: store.childName,
        childAge: store.childAge,
        childGender: store.childGender,
        favoriteThings: store.favoriteThings,
        personalityTraits: store.personalityTraits,
        theme: store.theme,
        storyStyle: store.storyStyle,
        illustrationStyle: store.illustrationStyle,
        dedication: store.dedication,
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Failed (${res.status})`);
        }

        setGenProgress("Parsing story...");
        const data = await res.json();

        setGeneratedTitle(data.title);
        const bookPages: BookPageView[] = data.pages.map((p: any) => ({
          pageNumber: p.pageNumber,
          type: p.type,
          text: p.text,
          textPosition: p.textPosition,
          illustrationUrl: null,
          isApproved: false,
        }));
        setGeneratedPages(bookPages);
        setPhase("preview");

        // Start image generation in background
        generateImages(data, controller.signal).catch((err) => {
          if ((err as Error).name !== "AbortError") {
            console.error("Image generation error:", err);
          }
        });
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Generation failed");
        setPhase("wizard");
        useWizardStore.getState().setStep(6);
      });
  }

  // ─── Generating Phase ───

  if (phase === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotateY: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl mx-auto"
          >
            📖
          </motion.div>
          <h1 className="font-display text-3xl font-bold">Generating Story...</h1>
          <p className="text-muted-foreground">{genProgress}</p>
          <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ─── Preview Phase ───

  if (phase === "preview") {
    const store = useWizardStore.getState();

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">Storymagic Demo</span>
            <Button variant="outline" size="sm" onClick={handleStartOver}>
              Start Over
            </Button>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{generatedTitle}</h1>
            <p className="text-muted-foreground mt-2">A story for {store.childName}</p>

            {/* Image progress indicator */}
            {imageProgress && imageProgress.stage !== "done" && (
              <div className="mt-4 max-w-sm mx-auto space-y-2">
                <p className="text-sm text-muted-foreground">
                  {imageProgress.stage === "character-ref"
                    ? "Generating character reference..."
                    : `Generating illustrations: ${imageProgress.done} of ${imageProgress.total}`}
                </p>
                <Progress
                  value={imageProgress.stage === "character-ref" ? 0 : imageProgress.done}
                  max={imageProgress.total}
                />
              </div>
            )}

            {imageProgress?.stage === "done" && (
              <p className="text-sm text-green-600 mt-3">All illustrations generated</p>
            )}

            {!imageProgress && (
              <p className="text-xs text-muted-foreground mt-1">
                {store.photoKey
                  ? "Preparing illustrations..."
                  : "Text only — no photo uploaded for illustrations"}
              </p>
            )}
          </div>
          <BookViewer
            pages={generatedPages}
            title={generatedTitle}
            childName={store.childName}
            coverImageUrl={null}
          />
        </main>
      </div>
    );
  }

  // ─── Wizard Phase ───

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Storymagic Demo</span>
          <span className="text-sm text-muted-foreground">Step {step} of 6</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <WizardProgressBar currentStep={step} />

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Demo-only: image limit selector */}
        {step === 6 && (
          <div className="mb-6 max-w-lg mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">
                Demo: Max illustrations to generate
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMaxImages(n)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      maxImages === n
                        ? "bg-amber-500 text-white shadow"
                        : "bg-white hover:bg-amber-100 text-amber-800 border border-amber-200"
                    )}
                  >
                    {n === 0 ? "All" : n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-700 mt-2">
                {maxImages === 0
                  ? "All pages (~17 images, ~$1.30)"
                  : `First ${maxImages} image${maxImages > 1 ? "s" : ""} only (~$${(maxImages * 0.075).toFixed(2)})`}
              </p>
            </div>
          </div>
        )}

        <WizardSteps
          uploadFile={demoUploadFile}
          allowSkip
          onSubmit={handleGenerate}
        />
      </main>
    </div>
  );
}
