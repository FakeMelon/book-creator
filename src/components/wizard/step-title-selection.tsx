"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
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

export function StepTitleSelection() {
  const store = useWizardStore();
  const {
    bookIdeas,
    selectedBookIdea,
    ideasInputFingerprint,
    childName,
    nextStep,
  } = store;

  const t = useTranslations("Wizard.titles");
  const tc = useTranslations("Common");
  const locale = useLocale();

  const [loading, setLoading] = useState(() => {
    const currentFingerprint = computeFingerprint(store);
    return bookIdeas.length === 0 || ideasInputFingerprint !== currentFingerprint;
  });
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
          language: locale,
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
        throw new Error(t("noIdeasError"));
      }

      current.setBookIdeas(ideas, computeFingerprint(current));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const currentFingerprint = computeFingerprint(store);
    if (bookIdeas.length === 0 || ideasInputFingerprint !== currentFingerprint) {
      fetchIdeas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount; fingerprint check handles staleness
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-lg mx-auto text-center">
        <div>
          <h2 className="font-display text-3xl font-bold">{t("loadingHeading")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("loadingMessage", { childName })}
          </p>
        </div>

        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 max-w-lg mx-auto text-center">
        <div>
          <h2 className="font-display text-3xl font-bold">{t("errorHeading")}</h2>
          <p className="text-muted-foreground mt-2">{t("errorSubheading")}</p>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>

        <Button onClick={fetchIdeas} size="lg" className="w-full">
          {tc("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">{t("mainHeading")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("subtitle", { childName })}
        </p>
      </div>

      <div className="space-y-3">
        {bookIdeas.map((idea, index) => (
          <button
            key={index}
            onClick={() => store.setSelectedBookIdea(idea)}
            className={cn(
              "w-full p-5 rounded-2xl text-start transition-all duration-200 border-2",
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
        {t("generateNew")}
      </button>

      <Button onClick={nextStep} disabled={!selectedBookIdea} size="lg" className="w-full">
        {tc("continue")}
      </Button>
    </div>
  );
}
