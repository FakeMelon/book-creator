"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StepTitleSelection() {
  const {
    selectedTitle,
    setSelectedTitle,
    titleOptions,
    setTitleOptions,
    childName,
    childAge,
    childGender,
    theme,
    occasion,
    favoriteThings,
    customFavoriteThings,
    personalityTraits,
    customPersonalityTraits,
    hobbies,
    customHobbies,
    favoriteCharacters,
    customFavoriteCharacters,
    favoriteAnimal,
    customFavoriteAnimals,
    nextStep,
    prevStep,
  } = useWizardStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (titleOptions.length > 0) return;

    async function fetchTitles() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/books/suggest-titles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childName,
            childAge,
            childGender,
            theme,
            occasion,
            favoriteThings: [...favoriteThings, ...customFavoriteThings],
            personalityTraits: [...personalityTraits, ...customPersonalityTraits],
            hobbies: [...hobbies, ...customHobbies],
            favoriteCharacters: [...favoriteCharacters, ...customFavoriteCharacters],
            favoriteAnimal: [...favoriteAnimal, ...customFavoriteAnimals],
          }),
        });

        if (!res.ok) throw new Error("Failed to generate titles");

        const data = await res.json();
        setTitleOptions(data.titles);
      } catch {
        setError("Failed to generate title suggestions. Please try again.");
      }

      setLoading(false);
    }

    fetchTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRetry() {
    setTitleOptions([]);
    setSelectedTitle("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/books/suggest-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName,
          childAge,
          childGender,
          theme,
          occasion,
          favoriteThings: [...favoriteThings, ...customFavoriteThings],
          personalityTraits: [...personalityTraits, ...customPersonalityTraits],
          hobbies: [...hobbies, ...customHobbies],
          favoriteCharacters: [...favoriteCharacters, ...customFavoriteCharacters],
          favoriteAnimal: [...favoriteAnimal, ...customFavoriteAnimals],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate titles");

      const data = await res.json();
      setTitleOptions(data.titles);
    } catch {
      setError("Failed to generate title suggestions. Please try again.");
    }

    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Choose a Title</h2>
        <p className="text-muted-foreground mt-2">
          Pick the perfect title for {childName}&apos;s book
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Generating title ideas...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}

      {!loading && titleOptions.length > 0 && (
        <>
          <div className="space-y-3">
            {titleOptions.map((title, index) => (
              <button
                key={index}
                onClick={() => setSelectedTitle(title)}
                className={cn(
                  "w-full p-5 rounded-2xl text-left transition-all duration-200 border-2",
                  selectedTitle === title
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-transparent bg-muted hover:bg-muted/80"
                )}
              >
                <p className="font-display text-xl font-bold">{title}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRetry}
            className="text-sm text-primary hover:underline w-full text-center"
          >
            Generate new suggestions
          </button>
        </>
      )}

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!selectedTitle} size="lg" className="flex-[2]">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
