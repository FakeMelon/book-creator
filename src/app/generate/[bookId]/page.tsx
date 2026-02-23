"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GENERATION_STAGES } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StageUpdate {
  stage: string;
  status: string;
  message: string;
  progress: number;
  metadata?: { pageNumber?: number; thumbnailUrl?: string };
}

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>("STORY_GENERATION");
  const [stages, setStages] = useState<Map<string, string>>(new Map());
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [bookTitle, setBookTitle] = useState("");

  useEffect(() => {
    const eventSource = new EventSource(`/api/stream/${bookId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "progress") {
        setCurrentStage(data.stage);
        setProgress(data.progress);
        setStages((prev) => new Map(prev).set(data.stage, data.status));

        if (data.metadata?.thumbnailUrl) {
          setThumbnails((prev) => [...prev, data.metadata.thumbnailUrl]);
        }
      }

      if (data.type === "complete") {
        setComplete(true);
        setProgress(100);
        setBookTitle(data.title || "Your Book");
      }

      if (data.type === "error") {
        setError(data.message);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [bookId]);

  const funMessages = [
    "Mixing the perfect colors...",
    "Adding a sprinkle of magic...",
    "Teaching the characters to smile...",
    "Hiding a secret on every page...",
    "Making sure the story has a happy ending...",
  ];

  const [funMessageIndex, setFunMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFunMessageIndex((i) => (i + 1) % funMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [funMessages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Storymagic
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {!complete && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {/* Animated book icon */}
            <div className="w-24 h-24 mx-auto relative">
              <motion.div
                animate={{ rotateY: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center text-5xl"
              >
                📖
              </motion.div>
            </div>

            <div>
              <h1 className="font-display text-3xl font-bold">Creating Your Book</h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={funMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted-foreground mt-2"
                >
                  {funMessages[funMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-4" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </div>

            {/* Stage cards */}
            <div className="space-y-3 text-left">
              {GENERATION_STAGES.map((stage) => {
                const status = stages.get(stage.stage);
                const isCurrent = currentStage === stage.stage && status !== "COMPLETED";
                const isComplete = status === "COMPLETED";
                const isFailed = status === "FAILED";

                return (
                  <div
                    key={stage.stage}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                      isCurrent && "bg-primary/5 border border-primary/20",
                      isComplete && "bg-success/5",
                      isFailed && "bg-destructive/5",
                      !isCurrent && !isComplete && !isFailed && "opacity-50"
                    )}
                  >
                    <div className="text-2xl">
                      {isComplete ? "✅" : isFailed ? "❌" : isCurrent ? (
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                          {stage.icon}
                        </motion.span>
                      ) : stage.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{stage.label}</p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-muted-foreground"
                        >
                          {stage.description}
                        </motion.p>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sneak peek thumbnails */}
            {thumbnails.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3">Sneak peek</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {thumbnails.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Page preview`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Completion */}
        {complete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl">🎉</div>
            <h1 className="font-display text-3xl font-bold">Your Book is Ready!</h1>
            <p className="text-lg text-muted-foreground">
              &ldquo;{bookTitle}&rdquo; is waiting for you
            </p>
            <Button size="xl" onClick={() => router.push(`/preview/${bookId}`)}>
              Preview My Book
            </Button>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl">😔</div>
            <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
