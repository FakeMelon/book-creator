"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GENERATION_STAGES } from "@/constants";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/i18n/navigation";

interface StageUpdate {
  stage: string;
  status: string;
  message: string;
  progress: number;
  metadata?: { pageNumber?: number; thumbnailUrl?: string };
}

const FUN_MESSAGE_KEYS = ["msg1", "msg2", "msg3", "msg4", "msg5"] as const;

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const t = useTranslations("Generate");
  const tH = useTranslations("Header");
  const tCommon = useTranslations("Common");

  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>("STORY_GENERATION");
  const [stages, setStages] = useState<Map<string, string>>(new Map());
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [childName, setChildName] = useState("");

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
        if (data.childName) {
          setChildName(data.childName);
        }
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

  const [funMessageIndex, setFunMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFunMessageIndex((i) => (i + 1) % FUN_MESSAGE_KEYS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            {tH("brand")}
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
              <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={funMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted-foreground mt-2"
                >
                  {t(`funMessages.${FUN_MESSAGE_KEYS[funMessageIndex]}`)}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-4" />
              <p className="text-sm text-muted-foreground">
                {t("percentComplete", { percent: progress })}
              </p>
            </div>

            {/* Stage cards */}
            <div className="space-y-3 text-start">
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
                      <p className="font-semibold">
                        {t(`stages.${stage.stage}.label`)}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-muted-foreground"
                        >
                          {t(`stages.${stage.stage}.description`, { childName })}
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
                <p className="text-sm font-semibold mb-3">{t("sneakPeek")}</p>
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
            <h1 className="font-display text-3xl font-bold">{t("readyTitle")}</h1>
            <p className="text-lg text-muted-foreground">
              &ldquo;{bookTitle}&rdquo; {t("readySubtitle", { childName })}
            </p>
            <Button size="xl" onClick={() => router.push(`/preview/${bookId}`)}>
              {t("previewButton")}
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
            <h1 className="font-display text-2xl font-bold">{t("errorTitle")}</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>{tCommon("tryAgain")}</Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
