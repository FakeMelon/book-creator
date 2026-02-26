"use client";

import { AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { StepChildInfo } from "@/components/wizard/step-child-info";
import { StepCreativeDirection } from "@/components/wizard/step-creative-direction";
import { StepPhotoUpload } from "@/components/wizard/step-photo-upload";
import { StepStoryStyle } from "@/components/wizard/step-story-style";
import { StepTitleSelection } from "@/components/wizard/step-title-selection";
import { StepReview } from "@/components/wizard/step-review";

interface WizardStepsProps {
  /** Custom upload function for StepPhotoUpload */
  uploadFile?: (file: File) => Promise<string>;
}

export function WizardSteps({ uploadFile }: WizardStepsProps) {
  const step = useWizardStore((s) => s.step);

  return (
    <AnimatePresence mode="wait">
      {step === 1 && <StepChildInfo key="step1" />}
      {step === 2 && <StepCreativeDirection key="step2" />}
      {step === 3 && (
        <StepPhotoUpload
          key="step3"
          uploadFile={uploadFile}
        />
      )}
      {step === 4 && <StepStoryStyle key="step4" />}
      {step === 5 && <StepTitleSelection key="step5" />}
      {step === 6 && <StepReview key="step6" />}
    </AnimatePresence>
  );
}
