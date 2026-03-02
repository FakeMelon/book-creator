"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  enabled?: boolean;
}

export function useTypewriter({ text, speed = 40, enabled = true }: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (!enabled || prefersReducedMotion.current) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let i = 0;

    function tick() {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i < text.length) {
        timeoutRef.current = setTimeout(tick, speed);
      } else {
        setIsComplete(true);
      }
    }

    timeoutRef.current = setTimeout(tick, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}
