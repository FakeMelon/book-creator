"use client";

import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ILLUSTRATION_STYLES } from "@/constants";
import { cn } from "@/lib/utils";
import type { IllustrationStyle, StoryStyle } from "@/types";

export function StepStoryStyle() {
  const {
    storyStyle,
    illustrationStyle,
    dedication,
    setStoryStyle,
    setIllustrationStyle,
    setDedication,
    nextStep,
    prevStep,
  } = useWizardStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Story Style</h2>
        <p className="text-muted-foreground mt-2">Choose how your book looks and reads</p>
      </div>

      {/* Prose vs Rhyme */}
      <div>
        <label className="block text-sm font-semibold mb-3">Writing Style</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              value: "PROSE" as StoryStyle,
              label: "Prose",
              description: "Flowing narrative with beautiful descriptions",
              example: '"Luna tiptoed through the garden, her heart racing with excitement..."',
            },
            {
              value: "RHYME" as StoryStyle,
              label: "Rhyme",
              description: "Fun rhyming verse with playful rhythm",
              example: '"Through the garden, Luna crept / While the little flowers slept..."',
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStoryStyle(option.value)}
              className={cn(
                "text-left p-5 rounded-xl transition-all duration-200 border-2",
                storyStyle === option.value
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-transparent bg-muted hover:bg-muted/80"
              )}
            >
              <p className="font-bold text-lg">{option.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              <p className="text-xs italic text-muted-foreground mt-3 border-l-2 border-primary/30 pl-3">
                {option.example}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Illustration Style */}
      <div>
        <label className="block text-sm font-semibold mb-3">Illustration Style</label>
        <div className="grid grid-cols-2 gap-4">
          {ILLUSTRATION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setIllustrationStyle(style.id as IllustrationStyle)}
              className={cn(
                "text-left p-5 rounded-xl transition-all duration-200 border-2",
                illustrationStyle === style.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-transparent bg-muted hover:bg-muted/80"
              )}
            >
              <div className="w-full h-24 rounded-lg bg-gradient-to-br from-muted to-muted/50 mb-3 flex items-center justify-center text-4xl">
                {style.id === "WATERCOLOR_WHIMSY" && "🎨"}
                {style.id === "BRIGHT_AND_BOLD" && "🌈"}
                {style.id === "STORYBOOK_CLASSIC" && "📚"}
                {style.id === "COZY_AND_WARM" && "🕯️"}
              </div>
              <p className="font-bold">{style.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dedication */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Dedication <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          value={dedication}
          onChange={(e) => setDedication(e.target.value)}
          placeholder='e.g. "For our little explorer — Love, Mom & Dad"'
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">{dedication.length}/200 characters</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} size="lg" className="flex-[2]">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
