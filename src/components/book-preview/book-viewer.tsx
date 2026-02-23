"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BookPageView } from "@/types";

interface BookViewerProps {
  pages: BookPageView[];
  title: string | null;
  childName: string;
  coverImageUrl: string | null;
}

export function BookViewer({ pages, title, childName, coverImageUrl }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = pages.length;

  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  const page = pages[currentPage];

  return (
    <div ref={containerRef} className="relative">
      {/* Book display */}
      <div className="relative max-w-2xl mx-auto">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, rotateY: -10 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative aspect-square bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Illustration */}
          {page?.illustrationUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.illustrationUrl}
              alt={`Page ${page.pageNumber}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Text overlay */}
          {page?.text && (
            <div
              className={cn(
                "absolute inset-x-0 p-6 flex items-center justify-center",
                page.textPosition === "top" && "top-0",
                page.textPosition === "bottom" && "bottom-0",
                page.textPosition === "center" && "inset-0",
                page.textPosition === "overlay" && "inset-0"
              )}
            >
              <div
                className={cn(
                  "max-w-md text-center",
                  page.illustrationUrl && "bg-white/85 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                )}
              >
                {page.type === "COVER" || page.type === "TITLE" ? (
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {page.text}
                  </h1>
                ) : page.type === "DEDICATION" ? (
                  <p className="font-story text-lg italic text-muted-foreground">{page.text}</p>
                ) : (
                  <p className="font-story text-base md:text-lg leading-relaxed">{page.text}</p>
                )}
              </div>
            </div>
          )}

          {/* Page number */}
          {page?.type === "ILLUSTRATION" && (
            <div className="absolute bottom-2 right-4 text-xs text-white/60 font-medium">
              {page.pageNumber}
            </div>
          )}
        </motion.div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goNext}
          disabled={currentPage === totalPages - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between mt-6">
        {/* Page indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        {/* Page dots */}
        <div className="flex gap-1 overflow-x-auto max-w-xs">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all shrink-0",
                i === currentPage ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
