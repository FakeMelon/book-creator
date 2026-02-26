"use client";

import { useEffect, useRef } from "react";
import type { BookStatus } from "@prisma/client";

interface CoverStatusData {
  status: BookStatus;
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

const MAX_CONSECUTIVE_ERRORS = 5;
const MAX_POLL_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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
    let consecutiveErrors = 0;
    const startTime = Date.now();

    async function poll() {
      if (!active) return;

      if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
        active = false;
        onErrorRef.current("Cover generation timed out. Please try again.");
        return;
      }

      try {
        const res = await fetch(`/api/books/${bookId}/status`);
        if (!res.ok) {
          consecutiveErrors++;
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            active = false;
            onErrorRef.current(
              res.status === 401
                ? "Your session has expired. Please sign in again."
                : "Unable to check cover status. Please try again."
            );
          }
          return;
        }

        consecutiveErrors = 0;
        const data: CoverStatusData = await res.json();

        if (!active) return;

        if (data.status === "COVER_READY") {
          active = false;
          onCoverReadyRef.current(data);
        } else if (data.status === "DRAFT" && data.generationError) {
          active = false;
          onErrorRef.current(data.generationError);
        }
      } catch {
        // Network error — next poll will retry automatically
        consecutiveErrors++;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          active = false;
          onErrorRef.current("Lost connection. Please check your internet and try again.");
        }
      }
    }

    poll();

    const timer = setInterval(poll, interval);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bookId, enabled, interval]);
}
