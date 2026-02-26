"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import {
  THEMES,
  PERSONALITY_TRAITS,
  OCCASION_OPTIONS,
  OCCASION_EMOJIS,
  HOBBY_OPTIONS,
  HOBBY_EMOJIS,
  ANIMAL_OPTIONS,
  ANIMAL_EMOJIS,
  FOOD_OPTIONS,
  FOOD_EMOJIS,
} from "@/constants";
import { cn } from "@/lib/utils";

const MULTI_CONCEPT_PATTERN = /\s+(and|or|&)\s+|[,;\/]/i;

function detectMultiConcept(text: string): string[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Split by common separators: ", " / " and " / " or " / " & " / ";" / "/"
  const parts = trimmed
    .split(/\s+(?:and|or|&)\s+|[,;\/]/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : null;
}

function AddCustomInput({
  placeholder,
  onAdd,
  disabled,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  function handleChange(text: string) {
    setValue(text);
    if (MULTI_CONCEPT_PATTERN.test(text)) {
      setSuggestions(detectMultiConcept(text));
    } else {
      setSuggestions(null);
    }
  }

  function handleAdd() {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
      setSuggestions(null);
    }
  }

  function handleAddAll(parts: string[]) {
    for (const part of parts) {
      onAdd(part);
    }
    setValue("");
    setSuggestions(null);
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !value.trim()}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
      </div>

      {suggestions && suggestions.length > 1 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-muted-foreground font-medium">
            Looks like you have multiple items — add them separately for best results!
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((part, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onAdd(part);
                  const remaining = suggestions.filter((_, j) => j !== i);
                  if (remaining.length <= 1) {
                    setValue(remaining[0] ?? "");
                    setSuggestions(null);
                  } else {
                    setSuggestions(remaining);
                    setValue(remaining.join(", "));
                  }
                }}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                + {part}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleAddAll(suggestions)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Add all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
      >
        x
      </button>
    </span>
  );
}

const SUB_STEPS = [
  { label: "Occasion & Theme", hint: "What's the story about?" },
  { label: "About the Child", hint: "Tell us what makes them special" },
  { label: "Extras", hint: "Optional details for a richer story" },
];

export function StepCreativeDirection() {
  const [subStep, setSubStep] = useState(0);

  const {
    occasion,
    setOccasion,
    personalityTraits,
    customPersonalityTraits,
    togglePersonalityTrait,
    addCustomPersonalityTrait,
    removeCustomPersonalityTrait,
    hobbies,
    customHobbies,
    toggleHobby,
    addCustomHobby,
    removeCustomHobby,
    favoriteFoods,
    customFavoriteFoods,
    toggleFavoriteFood,
    addCustomFavoriteFood,
    removeCustomFavoriteFood,
    favoriteAnimal,
    customFavoriteAnimals,
    toggleFavoriteAnimal,
    addCustomFavoriteAnimal,
    removeCustomFavoriteAnimal,
    theme,
    setTheme,
    nextStep,
    prevStep,
  } = useWizardStore();

  const totalTraits = personalityTraits.length + customPersonalityTraits.length;
  const totalHobbies = hobbies.length + customHobbies.length;
  const totalFoods = favoriteFoods.length + customFavoriteFoods.length;
  const totalAnimals = favoriteAnimal.length + customFavoriteAnimals.length;

  // Validation per sub-step
  const subStepValid = [
    occasion !== "" && theme !== "",                  // Sub-step 0: Occasion + Theme
    totalHobbies >= 1 && totalTraits >= 1,              // Sub-step 1: Hobbies + Traits
    true,                                              // Sub-step 2: Optional extras (always valid)
  ];

  function handleNext() {
    if (subStep < SUB_STEPS.length - 1) {
      setSubStep(subStep + 1);
    } else {
      nextStep();
    }
  }

  function handleBack() {
    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      prevStep();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">{SUB_STEPS[subStep].label}</h2>
        <p className="text-muted-foreground mt-2">{SUB_STEPS[subStep].hint}</p>
      </div>

      {/* Sub-step dots */}
      <div className="flex items-center justify-center gap-2">
        {SUB_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === subStep
                ? "bg-primary w-6"
                : i < subStep
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Sub-step content */}
      <AnimatePresence mode="wait">
        {subStep === 0 && (
          <motion.div
            key="sub0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Occasion */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                What's the occasion? <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASION_OPTIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      occasion === occ
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {OCCASION_EMOJIS[occ] && <span>{OCCASION_EMOJIS[occ]}</span>}
                    <span>{occ}</span>
                  </button>
                ))}
                {occasion && !OCCASION_OPTIONS.includes(occasion) && (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow">
                    {occasion}
                    <button
                      type="button"
                      onClick={() => setOccasion("")}
                      className="ml-0.5 hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      x
                    </button>
                  </span>
                )}
              </div>
              <AddCustomInput
                placeholder="Or type your own occasion..."
                onAdd={(val) => setOccasion(val)}
                disabled={false}
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Pick a story theme <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 border-2",
                      theme === t.id
                        ? "border-primary bg-primary/5 shadow-lg scale-105"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    )}
                  >
                    <span className="text-3xl">{t.icon}</span>
                    <span className="text-sm font-semibold">{t.name}</span>
                    <span className="text-xs text-muted-foreground text-center">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {subStep === 1 && (
          <motion.div
            key="sub1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Personality Traits <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground font-normal">({totalTraits}/3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button
                    key={trait.id}
                    onClick={() => togglePersonalityTrait(trait.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      personalityTraits.includes(trait.id)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <span>{trait.emoji}</span>
                    <span>{trait.label}</span>
                  </button>
                ))}
                {customPersonalityTraits.map((trait) => (
                  <CustomBadge
                    key={trait}
                    label={trait}
                    onRemove={() => removeCustomPersonalityTrait(trait)}
                  />
                ))}
              </div>
              <AddCustomInput
                placeholder="Add your own..."
                onAdd={addCustomPersonalityTrait}
                disabled={totalTraits >= 3}
              />
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Hobbies <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground font-normal">({totalHobbies}/5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      hobbies.includes(hobby)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {HOBBY_EMOJIS[hobby] && <span>{HOBBY_EMOJIS[hobby]}</span>}
                    <span>{hobby}</span>
                  </button>
                ))}
                {customHobbies.map((hobby) => (
                  <CustomBadge
                    key={hobby}
                    label={hobby}
                    onRemove={() => removeCustomHobby(hobby)}
                  />
                ))}
              </div>
              <AddCustomInput
                placeholder="Add your own..."
                onAdd={addCustomHobby}
                disabled={totalHobbies >= 5}
              />
            </div>
          </motion.div>
        )}

        {subStep === 2 && (
          <motion.div
            key="sub2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <p className="text-sm text-muted-foreground text-center">
              These are optional but help us make the story even more personal.
            </p>

            {/* Favorite Animal */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Favorite Animals{" "}
                <span className="text-muted-foreground font-normal">({totalAnimals}/3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ANIMAL_OPTIONS.map((animal) => (
                  <button
                    key={animal}
                    onClick={() => toggleFavoriteAnimal(animal)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      favoriteAnimal.includes(animal)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {ANIMAL_EMOJIS[animal] && <span>{ANIMAL_EMOJIS[animal]}</span>}
                    <span>{animal}</span>
                  </button>
                ))}
                {customFavoriteAnimals.map((animal) => (
                  <CustomBadge
                    key={animal}
                    label={animal}
                    onRemove={() => removeCustomFavoriteAnimal(animal)}
                  />
                ))}
              </div>
              <AddCustomInput
                placeholder="Add your own..."
                onAdd={addCustomFavoriteAnimal}
                disabled={totalAnimals >= 3}
              />
            </div>

            {/* Favorite Foods */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Favorite Foods{" "}
                <span className="text-muted-foreground font-normal">({totalFoods}/3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOD_OPTIONS.map((food) => (
                  <button
                    key={food}
                    onClick={() => toggleFavoriteFood(food)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      favoriteFoods.includes(food)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {FOOD_EMOJIS[food] && <span>{FOOD_EMOJIS[food]}</span>}
                    <span>{food}</span>
                  </button>
                ))}
                {customFavoriteFoods.map((food) => (
                  <CustomBadge
                    key={food}
                    label={food}
                    onRemove={() => removeCustomFavoriteFood(food)}
                  />
                ))}
              </div>
              <AddCustomInput
                placeholder="Add your own..."
                onAdd={addCustomFavoriteFood}
                disabled={totalFoods >= 3}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button onClick={handleBack} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!subStepValid[subStep]}
          size="lg"
          className="flex-[2]"
        >
          {subStep < SUB_STEPS.length - 1 ? "Continue" : "Next Step"}
        </Button>
      </div>
    </motion.div>
  );
}
