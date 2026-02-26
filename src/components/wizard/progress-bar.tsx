"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Child Info" },
  { number: 2, label: "Creative" },
  { number: 3, label: "Photos" },
  { number: 4, label: "Style" },
  { number: 5, label: "Book Idea" },
  { number: 6, label: "Cover Preview" },
];

interface ProgressBarProps {
  currentStep: number;
}

export function WizardProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Circles + connecting lines */}
      <div className="flex items-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0",
                currentStep > step.number
                  ? "bg-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.number ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 mx-3 h-0.5 rounded-full transition-all duration-500",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      {/* Labels row */}
      <div className="hidden sm:flex justify-between mt-2">
        {STEPS.map((step) => (
          <span
            key={step.number}
            className={cn(
              "text-xs font-medium w-10 text-center",
              currentStep >= step.number ? "text-primary" : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
