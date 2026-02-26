"use client";

import { useState, useEffect, useRef } from "react";
import { useWizardStore } from "@/hooks/use-wizard-store";
import type { BookPageView } from "@/types";

type DemoPhase = "wizard" | "generating" | "preview";

interface ImageProgress {
  stage: "character-ref" | "illustrations" | "done";
  done: number;
  total: number;
}

export interface DemoGeneration {
  phase: DemoPhase;
  generatedTitle: string;
  generatedPages: BookPageView[];
  genProgress: string;
  error: string;
  imageProgress: ImageProgress | null;
  demoUploadFile: (file: File) => Promise<string>;
  handleStartOver: () => void;
  handleGenerate: () => void;
}

/**
 * Encapsulates all demo-mode state & logic (story generation, image generation,
 * preview). Always called (hooks rules), but returns `null` when `enabled` is false.
 */
export function useDemoGeneration(enabled: boolean): DemoGeneration | null {
  const [phase, setPhase] = useState<DemoPhase>("wizard");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedPages, setGeneratedPages] = useState<BookPageView[]>([]);
  const [genProgress, setGenProgress] = useState("");
  const [error, setError] = useState("");
  const [imageProgress, setImageProgress] = useState<ImageProgress | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Reset wizard store on mount so demo always starts fresh
  useEffect(() => {
    if (!enabled) return;
    const store = useWizardStore.getState();
    if (store.onboardingComplete) {
      store.resetWizard();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [enabled]);

  // ─── Demo Photo Upload Handler ───

  async function demoUploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const { filename } = await res.json();
    return filename;
  }

  // ─── Start Over ───

  function handleStartOver() {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("wizard");
    useWizardStore.getState().resetWizard();
    setGeneratedTitle("");
    setGeneratedPages([]);
    setGenProgress("");
    setError("");
    setImageProgress(null);
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

    // Demo mode: limit to 1 image to control costs
    const illustrationPages = allIllustrationPages.slice(0, 1);
    const total = illustrationPages.length;

    // Phase 1: Character reference (if photo was uploaded)
    let characterRefId: string | null = null;

    if (photoKey) {
      setImageProgress({ stage: "character-ref", done: 0, total });

      try {
        const res = await fetch("/api/story/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "character-ref",
            photoId: photoKey.replace(/\.[^.]+$/, ""),
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
          const res = await fetch("/api/story/image", {
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

    fetch("/api/story/generate", {
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

  if (!enabled) return null;

  return {
    phase,
    generatedTitle,
    generatedPages,
    genProgress,
    error,
    imageProgress,
    demoUploadFile,
    handleStartOver,
    handleGenerate,
  };
}
