"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLocale } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { StepChildInfo } from "@/components/wizard/step-child-info";
import { StepCreativeDirection } from "@/components/wizard/step-creative-direction";
import { StepPhotoUpload } from "@/components/wizard/step-photo-upload";
import { StepStoryStyle } from "@/components/wizard/step-story-style";
import { StepTitleSelection } from "@/components/wizard/step-title-selection";
import { StepReview } from "@/components/wizard/step-review";

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 20 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -20 }),
};

interface WizardStepsProps {
  /** Custom upload function for StepPhotoUpload */
  uploadFile?: (file: File) => Promise<string>;
}

export function WizardSteps({ uploadFile }: WizardStepsProps) {
  const step = useWizardStore((s) => s.step);
  const direction = useWizardStore((s) => s.direction);
  const locale = useLocale();
  const isRTL = locale === "he";

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
