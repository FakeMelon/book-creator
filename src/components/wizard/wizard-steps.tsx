"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLocale } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { StepChildInfo } from "@/components/wizard/step-child-info";
import { StepCreativeDirection } from "@/components/wizard/step-creative-direction";
import { StepPhotoUpload } from "@/components/wizard/step-photo-upload";
import { StepStoryStyle } from "@/components/wizard/step-story-style";
import { StepTitleSelection } from "@/components/wizard/step-title-selection";
import { StepReview } from "@/components/wizard/step-review";
import { AGE_RANGE_OPTIONS, THEMES, OCCASION_OPTIONS, ILLUSTRATION_STYLES, GENDER_OPTIONS } from "@/constants";

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 20 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -20 }),
};

interface WizardStepsProps {
  /** Custom upload function for StepPhotoUpload */
  uploadFile?: (file: File) => Promise<string>;
}

// All wizard images to preload on mount
const WIZARD_IMAGES = [
  ...AGE_RANGE_OPTIONS.map((r) => r.image),
  ...THEMES.map((t) => t.image),
  ...OCCASION_OPTIONS.flatMap((o) => o.image ? [o.image] : []),
  ...ILLUSTRATION_STYLES.map((s) => s.previewImage),
  ...GENDER_OPTIONS.map((g) => g.image),
];

export function WizardSteps({ uploadFile }: WizardStepsProps) {
  const step = useWizardStore((s) => s.step);
  const direction = useWizardStore((s) => s.direction);
  const locale = useLocale();
  const isRTL = locale === "he";

  // Preload all wizard images on mount so they're cached before the user needs them.
  // Load in small batches to avoid overwhelming browser connection limits.
  useEffect(() => {
    const cache: HTMLImageElement[] = [];
    let cancelled = false;
    async function preload() {
      const BATCH = 6;
      for (let i = 0; i < WIZARD_IMAGES.length; i += BATCH) {
        if (cancelled) break;
        await Promise.all(
          WIZARD_IMAGES.slice(i, i + BATCH).map(
            (src) =>
              new Promise<void>((resolve) => {
                const img = new window.Image();
                img.onload = img.onerror = () => resolve();
                img.src = src;
                cache.push(img);
              }),
          ),
        );
      }
    }
    preload();
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveDir = isRTL ? -direction : direction;

  const content = (() => {
    switch (step) {
      case 1: return <StepChildInfo />;
      case 2: return <StepCreativeDirection />;
      case 3: return <StepPhotoUpload uploadFile={uploadFile} />;
      case 4: return <StepStoryStyle />;
      case 5: return <StepTitleSelection />;
      case 6: return <StepReview />;
      default:
        console.error(`Invalid wizard step: ${step}. Resetting to step 1.`);
        useWizardStore.getState().setStep(1);
        return <StepChildInfo />;
    }
  })();

  return (
    <AnimatePresence mode="wait" custom={effectiveDir}>
      <motion.div
        key={step}
        custom={effectiveDir}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}
