"use client";

import { useState, useRef, useCallback } from "react";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { THEMES } from "@/constants";

type CoverPhase = "idle" | "front-cover" | "back-cover" | "done";

interface DemoCoverData {
  title: string;
  coverImageUrl: string;
  backCoverImageUrl: string;
}

export interface DemoCoverGeneration {
  generate: () => void;
  phase: CoverPhase;
  progress: number;
  coverData: DemoCoverData | null;
  error: string | null;
}

const PHASE_PROGRESS: Record<CoverPhase, number> = {
  idle: 0,
  "front-cover": 25,
  "back-cover": 65,
  done: 100,
};

/**
 * Demo-mode cover generation hook. Generates front and back cover images
 * directly from wizard data — passes the child's photo as a direct reference
 * (no character ref sheet, no story generation, no DB, no polling).
 */
export function useDemoCoverGeneration(enabled: boolean): DemoCoverGeneration | null {
  const [phase, setPhase] = useState<CoverPhase>("idle");
  const [coverData, setCoverData] = useState<DemoCoverData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setError(null);
    setCoverData(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const store = useWizardStore.getState();
    const title = store.selectedTitle;
    const themeConfig = THEMES.find((t) => t.id === store.theme);

    // Build cover scene description from wizard data
    const coverScene = `A vibrant children's book cover. The main character is ${store.childName}, age ${store.childAge}. The theme is ${themeConfig?.name || store.theme} — ${themeConfig?.storyPromptHint || ""}. ${store.selectedBookIdea?.description || ""} The scene should be inviting, magical, and capture the essence of the story.`;

    const backCoverMotif = themeConfig?.name
      ? `${themeConfig.name.toLowerCase()}-themed decorative elements`
      : "stars and magical swirls";

    try {
      // Step 1: Generate front cover illustration
      setPhase("front-cover");
      const frontRes = await fetch("/api/story/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "illustration",
          photoFilename: store.photoKey || undefined,
          sceneDescription: coverScene,
          illustrationStyle: store.illustrationStyle,
          pageNumber: 1,
          pageType: "COVER",
          bookTitle: title,
        }),
        signal,
      });

      if (!frontRes.ok) throw new Error("Front cover generation failed");
      const frontData = await frontRes.json();
      if (signal.aborted) return;

      // Step 2: Generate back cover illustration
      setPhase("back-cover");
      const backRes = await fetch("/api/story/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "illustration",
          sceneDescription: `Decorative back cover pattern with ${backCoverMotif}`,
          illustrationStyle: store.illustrationStyle,
          pageNumber: 32,
          pageType: "BACK_COVER",
          hiddenMotif: backCoverMotif,
        }),
        signal,
      });

      if (!backRes.ok) throw new Error("Back cover generation failed");
      const backData = await backRes.json();

      if (signal.aborted) return;

      setCoverData({
        title,
        coverImageUrl: frontData.imageDataUrl,
        backCoverImageUrl: backData.imageDataUrl,
      });
      setPhase("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Cover generation failed");
      setPhase("idle");
    }
  }, []);

  if (!enabled) return null;

  return {
    generate,
    phase,
    progress: PHASE_PROGRESS[phase],
    coverData,
    error,
  };
}
