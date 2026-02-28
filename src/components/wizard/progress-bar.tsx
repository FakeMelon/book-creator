"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const STEP_NUMBERS = [1, 2, 3, 4, 5, 6];
const STEP_KEYS = ["step1", "step2", "step3", "step4", "step5", "step6"] as const;

interface ProgressBarProps {
  currentStep: number;
}

export function WizardProgressBar({ currentStep }: ProgressBarProps) {
  const t = useTranslations("Wizard.progress");

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Circles + connecting lines */}
      <div className="flex items-center">
        {STEP_NUMBERS.map((stepNumber, index) => (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
                currentStep > stepNumber
                  ? "bg-primary text-primary-foreground"
                  : currentStep === stepNumber
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > stepNumber ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            {index < STEP_NUMBERS.length - 1 && (
              <div
                className={cn(
                  "flex-1 mx-3 h-0.5 rounded-full transition-all duration-500",
                  currentStep > stepNumber ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      {/* Labels row */}
      <div className="hidden sm:flex justify-between mt-2">
        {STEP_KEYS.map((key, index) => (
          <span
            key={key}
            className={cn(
              "text-xs font-medium w-10 text-center",
              currentStep >= index + 1 ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t(key)}
          </span>
        ))}
      </div>
    </div>
  );
}
