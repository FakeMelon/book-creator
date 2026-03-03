"use client";

import { useState } from "react";
import { useWizardStore } from "@/hooks/use-wizard-store";

const STEP_LABELS = [
  "Child Info",
  "Creative",
  "Photos",
  "Style",
  "Titles",
  "Review",
];

const DUMMY_DATA = {
  childName: "Luna",
  childAge: 5 as number | null,
  childGender: "girl",
  occasion: "birthday",
  theme: "adventure",
  personalityTraits: ["brave", "curious"],
  customPersonalityTraits: [],
  hobbies: ["drawing", "outdoor-play"],
  customHobbies: [],
  favoriteAnimal: ["bunny"],
  customFavoriteAnimals: [],
  favoriteFoods: ["pizza", "ice-cream"],
  customFavoriteFoods: [],
  favoriteCharacters: [],
  customFavoriteCharacters: [],
  favoriteThings: [],
  customFavoriteThings: [],
  storyStyle: "PROSE" as const,
  illustrationStyle: "WATERCOLOR_WHIMSY" as const,
  dedication: "For Luna, who makes every day an adventure.",
  selectedTitle: "Luna and the Secret Garden",
  bookIdeas: [
    { title: "Luna and the Secret Garden", description: "A brave girl discovers a hidden garden full of talking animals." },
    { title: "The Great Birthday Quest", description: "Luna sets off on a magical treasure hunt for her 5th birthday." },
    { title: "Luna's Starlight Adventure", description: "A curious explorer follows a shooting star to a faraway land." },
  ],
  selectedBookIdea: {
    title: "Luna and the Secret Garden",
    description: "A brave girl discovers a hidden garden full of talking animals.",
  },
  onboardingComplete: true,
};

export function DebugPanel() {
  const [collapsed, setCollapsed] = useState(true);
  const step = useWizardStore((s) => s.step);

  if (process.env.NODE_ENV !== "development") return null;

  function jumpTo(target: number) {
    const store = useWizardStore.getState();
    useWizardStore.setState({
      step: target,
      direction: target >= store.step ? 1 : -1,
      maxStepReached: Math.max(store.maxStepReached, target),
    });
  }

  function fillDummy() {
    const store = useWizardStore.getState();
    useWizardStore.setState({
      ...DUMMY_DATA,
      // Compute the fingerprint so step 5 doesn't re-fetch
      ideasInputFingerprint: JSON.stringify({
        childName: DUMMY_DATA.childName,
        childAge: DUMMY_DATA.childAge,
        childGender: DUMMY_DATA.childGender,
        personalityTraits: [...DUMMY_DATA.personalityTraits, ...DUMMY_DATA.customPersonalityTraits].sort(),
        theme: DUMMY_DATA.theme,
        occasion: DUMMY_DATA.occasion,
        hobbies: [...DUMMY_DATA.hobbies, ...DUMMY_DATA.customHobbies].sort(),
        favoriteCharacters: [...DUMMY_DATA.favoriteCharacters, ...DUMMY_DATA.customFavoriteCharacters].sort(),
        favoriteAnimal: [...DUMMY_DATA.favoriteAnimal, ...DUMMY_DATA.customFavoriteAnimals].sort(),
        favoriteFoods: [...DUMMY_DATA.favoriteFoods, ...DUMMY_DATA.customFavoriteFoods].sort(),
        storyStyle: DUMMY_DATA.storyStyle,
        illustrationStyle: DUMMY_DATA.illustrationStyle,
      }),
      maxStepReached: Math.max(store.maxStepReached, 6),
    });
  }

  function resetAll() {
    useWizardStore.getState().reset();
    // Re-set onboarding so we don't get redirected
    useWizardStore.setState({ onboardingComplete: true });
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-3 right-3 z-[9999] bg-gray-900 text-white text-xs font-mono px-2 py-1 rounded shadow-lg opacity-60 hover:opacity-100 transition-opacity"
      >
        DBG
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-[9999] bg-gray-900 text-white text-xs font-mono rounded-lg shadow-xl p-3 space-y-2 min-w-[180px]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">
          Debug
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-white"
        >
          x
        </button>
      </div>

      {/* Step jump buttons */}
      <div className="grid grid-cols-3 gap-1">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isCurrent = step === stepNum;
          return (
            <button
              key={stepNum}
              onClick={() => jumpTo(stepNum)}
              className={`px-1 py-1.5 rounded text-[10px] leading-tight transition-colors ${
                isCurrent
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {stepNum}. {label}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1">
        <button
          onClick={fillDummy}
          className="flex-1 bg-green-700 hover:bg-green-600 text-white px-2 py-1.5 rounded text-[10px] transition-colors"
        >
          Fill Dummy
        </button>
        <button
          onClick={resetAll}
          className="flex-1 bg-red-700 hover:bg-red-600 text-white px-2 py-1.5 rounded text-[10px] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
