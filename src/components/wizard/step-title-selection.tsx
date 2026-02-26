"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookIdea } from "@/types";

function computeFingerprint(state: {
  childName: string;
  childAge: number | null;
  childGender: string;
  personalityTraits: string[];
  customPersonalityTraits: string[];
  theme: string;
  occasion: string;
  hobbies: string[];
  customHobbies: string[];
  favoriteCharacters: string[];
  customFavoriteCharacters: string[];
  favoriteAnimal: string[];
  customFavoriteAnimals: string[];
  favoriteFoods: string[];
  customFavoriteFoods: string[];
  storyStyle: string;
  illustrationStyle: string;
}): string {
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

export function StepTitleSelection() {
  const store = useWizardStore();
  const {
    bookIdeas,
    selectedBookIdea,
    ideasInputFingerprint,
    setBookIdeas,
    setSelectedBookIdea,
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
      const allTraits = [...store.personalityTraits, ...store.customPersonalityTraits];
      const allHobbies = [...store.hobbies, ...store.customHobbies];
      const allCharacters = [...store.favoriteCharacters, ...store.customFavoriteCharacters];
      const allAnimals = [...store.favoriteAnimal, ...store.customFavoriteAnimals];
      const allFoods = [...store.favoriteFoods, ...store.customFavoriteFoods];

      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: store.childName,
          childAge: store.childAge,
          childGender: store.childGender,
          personalityTraits: allTraits,
          theme: store.theme,
          occasion: store.occasion,
          hobbies: allHobbies.length > 0 ? allHobbies : undefined,
          favoriteCharacters: allCharacters.length > 0 ? allCharacters : undefined,
          favoriteAnimal: allAnimals.length > 0 ? allAnimals : undefined,
          favoriteFoods: allFoods.length > 0 ? allFoods : undefined,
          storyStyle: store.storyStyle,
          illustrationStyle: store.illustrationStyle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate ideas");
      }

      const { ideas } = await res.json();
      setBookIdeas(ideas, computeFingerprint(store));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentFingerprint = computeFingerprint(store);
    if (bookIdeas.length === 0 || ideasInputFingerprint !== currentFingerprint) {
      fetchIdeas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(idea: BookIdea) {
    setSelectedBookIdea(idea);
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
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
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
            onClick={() => handleSelect(idea)}
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
