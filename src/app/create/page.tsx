"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWizardStore, useWizardHydrated } from "@/hooks/use-wizard-store";
import { useDemoGeneration } from "@/hooks/use-demo-generation";
import { isDemoMode } from "@/lib/config";
import { WizardProgressBar } from "@/components/wizard/progress-bar";
import { WizardSteps } from "@/components/wizard/wizard-steps";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookViewer } from "@/components/book-preview/book-viewer";

export default function CreatePage() {
  const router = useRouter();
  const hasHydrated = useWizardHydrated();
  const step = useWizardStore((s) => s.step);
  const prevStep = useWizardStore((s) => s.prevStep);
  const onboardingComplete = useWizardStore((s) => s.onboardingComplete);

  const demo = useDemoGeneration(isDemoMode);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (hasHydrated && !onboardingComplete) {
      router.replace("/get-started");
    }
  }, [hasHydrated, onboardingComplete, router]);

  if (!hasHydrated || !onboardingComplete) return null;

  // ─── Demo: Generating Phase ───

  if (demo?.phase === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotateY: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl mx-auto"
          >
            📖
          </motion.div>
          <h1 className="font-display text-3xl font-bold">Generating Story...</h1>
          <p className="text-muted-foreground">{demo.genProgress}</p>
          <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // ─── Demo: Preview Phase ───

  if (demo?.phase === "preview") {
    const store = useWizardStore.getState();

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <Header
          onBack={demo.handleStartOver}
          rightContent={
            <Button variant="outline" size="sm" onClick={demo.handleStartOver}>
              Start Over
            </Button>
          }
        />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{demo.generatedTitle}</h1>
            <p className="text-muted-foreground mt-2">A story for {store.childName}</p>

            {/* Image progress indicator */}
            {demo.imageProgress && demo.imageProgress.stage !== "done" && (
              <div className="mt-4 max-w-sm mx-auto space-y-2">
                <p className="text-sm text-muted-foreground">
                  {demo.imageProgress.stage === "character-ref"
                    ? "Generating character reference..."
                    : `Generating illustrations: ${demo.imageProgress.done} of ${demo.imageProgress.total}`}
                </p>
                <Progress
                  value={demo.imageProgress.stage === "character-ref" ? 0 : demo.imageProgress.done}
                  max={demo.imageProgress.total}
                />
              </div>
            )}

            {demo.imageProgress?.stage === "done" && (
              <p className="text-sm text-green-600 mt-3">All illustrations generated</p>
            )}

            {!demo.imageProgress && (
              <p className="text-xs text-muted-foreground mt-1">
                {store.photoKey
                  ? "Preparing illustrations..."
                  : "Text only — no photo uploaded for illustrations"}
              </p>
            )}
          </div>
          <BookViewer
            pages={demo.generatedPages}
            title={demo.generatedTitle}
            childName={store.childName}
            coverImageUrl={null}
          />
        </main>
      </div>
    );
  }

  // ─── Wizard Phase (shared for both modes) ───

  function handleBack() {
    if (step > 1) {
      prevStep();
    } else if (!isDemoMode) {
      router.push("/get-started");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <Header
        onBack={handleBack}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <WizardProgressBar currentStep={step} />

        {demo?.error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {demo.error}
          </div>
        )}

        <WizardSteps
          uploadFile={demo?.demoUploadFile}
          allowSkip={!!demo}
          onSubmit={demo?.handleGenerate}
        />
      </main>
    </div>
  );
}
