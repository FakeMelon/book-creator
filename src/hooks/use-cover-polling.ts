"use client";

import { useEffect, useRef } from "react";

interface CoverStatusData {
  status: string;
  title: string | null;
  coverImageUrl: string | null;
  backCoverImageUrl: string | null;
  generationError: string | null;
}

interface UseCoverPollingOptions {
  bookId: string | null;
  enabled: boolean;
  onCoverReady: (data: CoverStatusData) => void;
  onError: (message: string) => void;
  interval?: number;
}

export function useCoverPolling({
  bookId,
  enabled,
  onCoverReady,
  onError,
  interval = 3000,
}: UseCoverPollingOptions) {
  const onCoverReadyRef = useRef(onCoverReady);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCoverReadyRef.current = onCoverReady;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!bookId || !enabled) return;

    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/books/${bookId}/status`);
        if (!res.ok) return;

        const data: CoverStatusData = await res.json();

        if (!active) return;

        if (data.status === "COVER_READY") {
          onCoverReadyRef.current(data);
        } else if (data.status === "DRAFT" && data.generationError) {
          onErrorRef.current(data.generationError);
        }
      } catch {
        // Silently ignore network errors during polling
      }
    }

    // Poll immediately on mount
    poll();

    const timer = setInterval(poll, interval);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bookId, enabled, interval]);
}
