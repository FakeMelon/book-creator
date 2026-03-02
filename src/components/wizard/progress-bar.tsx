"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const STEP_NUMBERS = [1, 2, 3, 4, 5, 6];
const STEP_KEYS = ["step1", "step2", "step3", "step4", "step5", "step6"] as const;

interface ProgressBarProps {
  currentStep: number;
  maxStepReached: number;
  onStepClick?: (step: number) => void;
}

export function WizardProgressBar({ currentStep, maxStepReached, onStepClick }: ProgressBarProps) {
  const t = useTranslations("Wizard.progress");

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Circles + connecting lines */}
      <div className="flex items-center">
        {STEP_NUMBERS.map((stepNumber, index) => {
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isReachable = maxStepReached >= stepNumber && !isCurrent;

          const circleClasses = cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
            isCompleted
              ? "bg-primary text-primary-foreground"
              : isCurrent
              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
              : maxStepReached >= stepNumber
              ? "bg-primary/30 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          );

          const circleContent = isCompleted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            stepNumber
          );

          return (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            {isReachable && onStepClick ? (
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                aria-label={t(STEP_KEYS[index])}
                className={cn(circleClasses, "cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary/40")}
              >
                {circleContent}
              </button>
            ) : (
              <div className={circleClasses}>
                {circleContent}
              </div>
            )}
            {index < STEP_NUMBERS.length - 1 && (
              <div
                className={cn(
                  "flex-1 mx-3 h-0.5 rounded-full transition-all duration-500",
                  maxStepReached > stepNumber ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
          );
        })}
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
