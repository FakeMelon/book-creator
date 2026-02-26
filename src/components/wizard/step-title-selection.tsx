"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardState } from "@/types";

type FingerprintFields = Pick<
  WizardState,
  | "childName" | "childAge" | "childGender"
  | "personalityTraits" | "customPersonalityTraits"
  | "theme" | "occasion"
  | "hobbies" | "customHobbies"
  | "favoriteCharacters" | "customFavoriteCharacters"
  | "favoriteAnimal" | "customFavoriteAnimals"
  | "favoriteFoods" | "customFavoriteFoods"
  | "storyStyle" | "illustrationStyle"
>;

function computeFingerprint(state: FingerprintFields): string {
  return JSON.stringify({
    childName: state.childName,
    childAge: state.childAge,
    childGender: state.childGender,
    personalityTraits: [...state.personalityTraits, ...state.customPersonalityTraits].sort(),
    theme: state.theme,
    occasion: state.occasion,
    hobbies: [...state.hobbies, ...state.customHobbies].sort(),
    favoriteCharacters: [...state.favoriteCharacters, ...state.customFavoriteCharacters].sort(),
    favoriteAnimal: [...state.favoriteAnimal, ...state.customFavoriteAnimals].sort(),
    favoriteFoods: [...state.favoriteFoods, ...state.customFavoriteFoods].sort(),
    storyStyle: state.storyStyle,
    illustrationStyle: state.illustrationStyle,
  });
}

const stepTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
} as const;

export function StepTitleSelection() {
  const store = useWizardStore();
  const {
    bookIdeas,
    selectedBookIdea,
    ideasInputFingerprint,
    childName,
    nextStep,
    prevStep,
  } = store;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Always read current state at call time, not at closure creation time
      const current = useWizardStore.getState();

      const allTraits = [...current.personalityTraits, ...current.customPersonalityTraits];
      const allHobbies = [...current.hobbies, ...current.customHobbies];
      const allCharacters = [...current.favoriteCharacters, ...current.customFavoriteCharacters];
      const allAnimals = [...current.favoriteAnimal, ...current.customFavoriteAnimals];
      const allFoods = [...current.favoriteFoods, ...current.customFavoriteFoods];

      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: current.childName,
          childAge: current.childAge,
          childGender: current.childGender,
          personalityTraits: allTraits,
          theme: current.theme,
          occasion: current.occasion,
          hobbies: allHobbies.length > 0 ? allHobbies : undefined,
          favoriteCharacters: allCharacters.length > 0 ? allCharacters : undefined,
          favoriteAnimal: allAnimals.length > 0 ? allAnimals : undefined,
          favoriteFoods: allFoods.length > 0 ? allFoods : undefined,
          storyStyle: current.storyStyle,
          illustrationStyle: current.illustrationStyle,
        }),
      });

      if (!res.ok) {
        let errorMessage = `Server error (${res.status})`;
        try {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch {
          // Error response was not JSON; use the status-based message
        }
        throw new Error(errorMessage);
      }

      const responseData = await res.json();
      const ideas = responseData?.ideas;
      if (!Array.isArray(ideas) || ideas.length === 0) {
        throw new Error("No book ideas were returned. Please try again.");
      }

      current.setBookIdeas(ideas, computeFingerprint(current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentFingerprint = computeFingerprint(store);
    if (bookIdeas.length === 0 || ideasInputFingerprint !== currentFingerprint) {
      fetchIdeas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount; fingerprint check handles staleness
  }, []);

  if (loading) {
    return (
      <motion.div
        {...stepTransition}
        className="space-y-8 max-w-lg mx-auto text-center"
      >
        <div>
          <h2 className="font-display text-3xl font-bold">Brainstorming Ideas...</h2>
          <p className="text-muted-foreground mt-2">
            Our AI author is crafting unique book ideas for {childName}
          </p>
        </div>

        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        <Button onClick={prevStep} variant="outline" size="lg" className="w-full">
          Back
        </Button>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        {...stepTransition}
        className="space-y-8 max-w-lg mx-auto text-center"
      >
        <div>
          <h2 className="font-display text-3xl font-bold">Oops!</h2>
          <p className="text-muted-foreground mt-2">We couldn&apos;t generate book ideas</p>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>

        <div className="flex gap-3">
          <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
            Back
          </Button>
          <Button onClick={fetchIdeas} size="lg" className="flex-[2]">
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...stepTransition}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Choose a Book Idea</h2>
        <p className="text-muted-foreground mt-2">
          Pick the perfect story for {childName}&apos;s book
        </p>
      </div>

      <div className="space-y-3">
        {bookIdeas.map((idea, index) => (
          <button
            key={index}
            onClick={() => store.setSelectedBookIdea(idea)}
            className={cn(
              "w-full p-5 rounded-2xl text-left transition-all duration-200 border-2",
              selectedBookIdea?.title === idea.title
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-transparent bg-muted hover:bg-muted/80"
            )}
          >
            <p className="font-display text-xl font-bold">{idea.title}</p>
            <p className="text-muted-foreground text-sm mt-1">{idea.description}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={fetchIdeas}
        className="text-sm text-primary hover:underline w-full text-center"
      >
        Generate new ideas
      </button>

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!selectedBookIdea} size="lg" className="flex-[2]">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
