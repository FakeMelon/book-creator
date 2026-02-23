"use client";

import { useWizardStore } from "@/hooks/use-wizard-store";
import { WizardProgressBar } from "@/components/wizard/progress-bar";
import { WizardSteps } from "@/components/wizard/wizard-steps";
import Link from "next/link";

export default function CreatePage() {
  const step = useWizardStore((s) => s.step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Storymagic
          </Link>
          <span className="text-sm text-muted-foreground">Step {step} of 6</span>
        </div>
      </header>

      {/* Wizard */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <WizardProgressBar currentStep={step} />
        <WizardSteps />
      </main>
    </div>
  );
}
