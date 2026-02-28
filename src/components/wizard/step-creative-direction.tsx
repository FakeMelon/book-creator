"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import {
  THEMES,
  PERSONALITY_TRAITS,
  OCCASION_OPTIONS,
  HOBBY_OPTIONS,
  ANIMAL_OPTIONS,
  FOOD_OPTIONS,
} from "@/constants";
import { cn } from "@/lib/utils";

const MULTI_CONCEPT_PATTERN = /\s+(and|or|&)\s+|[,;\/]/i;

function detectMultiConcept(text: string): string[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

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
  addLabel,
  addAllLabel,
  multipleItemsSuggestion,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  disabled?: boolean;
  addLabel: string;
  addAllLabel: string;
  multipleItemsSuggestion: string;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  function handleChange(text: string): void {
    setValue(text);
    if (MULTI_CONCEPT_PATTERN.test(text)) {
      setSuggestions(detectMultiConcept(text));
    } else {
      setSuggestions(null);
    }
  }

  function handleAdd(): void {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
      setSuggestions(null);
    }
  }

  function handleAddAll(parts: string[]): void {
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
          {addLabel}
        </button>
      </div>

      {suggestions && suggestions.length > 1 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-muted-foreground font-medium">
            {multipleItemsSuggestion}
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
              {addAllLabel}
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
        className="ms-0.5 hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
      >
        x
      </button>
    </span>
  );
}

export function StepCreativeDirection() {
  const [subStep, setSubStep] = useState(0);
  const t = useTranslations("Wizard.creative");
  const tc = useTranslations("Common");
  const tConst = useTranslations("Constants");

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

  const subSteps = [
    { label: t("substep1Label"), hint: t("substep1Hint") },
    { label: t("substep2Label"), hint: t("substep2Hint") },
    { label: t("substep3Label"), hint: t("substep3Hint") },
  ];

  const subStepValid = [
    occasion !== "" && theme !== "",
    totalHobbies >= 1 && totalTraits >= 1,
    true,
  ];

  function handleNext(): void {
    if (subStep < subSteps.length - 1) {
      setSubStep(subStep + 1);
    } else {
      nextStep();
    }
  }

  function handleBack(): void {
    if (subStep > 0) {
      setSubStep(subStep - 1);
    } else {
      prevStep();
    }
  }

  const isKnownOccasion = OCCASION_OPTIONS.some((o) => o.id === occasion);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">{subSteps[subStep].label}</h2>
        <p className="text-muted-foreground mt-2">{subSteps[subStep].hint}</p>
      </div>

      {/* Sub-step dots */}
      <div className="flex items-center justify-center gap-2">
        {subSteps.map((_, i) => (
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
                {t("occasionLabel")} <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASION_OPTIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setOccasion(occ.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      occasion === occ.id
                        ? "bg-primary text-primary-foreground shadow"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <span>{occ.emoji}</span>
                    <span>{tConst(`occasions.${occ.id}`)}</span>
                  </button>
                ))}
                {occasion && !isKnownOccasion && (
                  <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow">
                    {occasion}
                    <button
                      type="button"
                      onClick={() => setOccasion("")}
                      className="ms-0.5 hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      x
                    </button>
                  </span>
                )}
              </div>
              <AddCustomInput
                placeholder={t("occasionPlaceholder")}
                onAdd={(val) => setOccasion(val)}
                disabled={false}
                addLabel={tc("add")}
                addAllLabel={tc("addAll")}
                multipleItemsSuggestion={t("multipleItemsSuggestion")}
              />
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                {t("themeLabel")} <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 border-2",
                      theme === themeOption.id
                        ? "border-primary bg-primary/5 shadow-lg scale-105"
                        : "border-transparent bg-muted hover:bg-muted/80"
                    )}
                  >
                    <span className="text-3xl">{themeOption.icon}</span>
                    <span className="text-sm font-semibold">
                      {tConst(`themes.${themeOption.id}.name`)}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {tConst(`themes.${themeOption.id}.description`)}
                    </span>
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
                {t("traitsLabel")} <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground font-normal">
                  {t("traitsCounter", { count: totalTraits })}
                </span>
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
                    <span>{tConst(`traits.${trait.id}`)}</span>
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
                placeholder={t("traitsPlaceholder")}
                onAdd={addCustomPersonalityTrait}
                disabled={totalTraits >= 3}
                addLabel={tc("add")}
                addAllLabel={tc("addAll")}
                multipleItemsSuggestion={t("multipleItemsSuggestion")}
              />
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("hobbiesLabel")} <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground font-normal">
                  {t("hobbiesCounter", { count: totalHobbies })}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {HOBBY_OPTIONS.map((hobby) => (
                  <button
                    key={hobby.id}
                    onClick={() => toggleHobby(hobby.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      hobbies.includes(hobby.id)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <span>{hobby.emoji}</span>
                    <span>{tConst(`hobbies.${hobby.id}`)}</span>
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
                placeholder={t("hobbiesPlaceholder")}
                onAdd={addCustomHobby}
                disabled={totalHobbies >= 5}
                addLabel={tc("add")}
                addAllLabel={tc("addAll")}
                multipleItemsSuggestion={t("multipleItemsSuggestion")}
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
              {t("optionalInfo")}
            </p>

            {/* Favorite Animals */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("animalsLabel")}{" "}
                <span className="text-muted-foreground font-normal">
                  {t("animalsCounter", { count: totalAnimals })}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ANIMAL_OPTIONS.map((animal) => (
                  <button
                    key={animal.id}
                    onClick={() => toggleFavoriteAnimal(animal.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      favoriteAnimal.includes(animal.id)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <span>{animal.emoji}</span>
                    <span>{tConst(`animals.${animal.id}`)}</span>
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
                placeholder={t("animalsPlaceholder")}
                onAdd={addCustomFavoriteAnimal}
                disabled={totalAnimals >= 3}
                addLabel={tc("add")}
                addAllLabel={tc("addAll")}
                multipleItemsSuggestion={t("multipleItemsSuggestion")}
              />
            </div>

            {/* Favorite Foods */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("foodsLabel")}{" "}
                <span className="text-muted-foreground font-normal">
                  {t("foodsCounter", { count: totalFoods })}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FOOD_OPTIONS.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => toggleFavoriteFood(food.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      favoriteFoods.includes(food.id)
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    <span>{food.emoji}</span>
                    <span>{tConst(`foods.${food.id}`)}</span>
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
                placeholder={t("foodsPlaceholder")}
                onAdd={addCustomFavoriteFood}
                disabled={totalFoods >= 3}
                addLabel={tc("add")}
                addAllLabel={tc("addAll")}
                multipleItemsSuggestion={t("multipleItemsSuggestion")}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button onClick={handleBack} variant="outline" size="lg" className="flex-1">
          {tc("back")}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!subStepValid[subStep]}
          size="lg"
          className="flex-[2]"
        >
          {subStep < subSteps.length - 1 ? tc("continue") : tc("nextStep")}
        </Button>
      </div>
    </motion.div>
  );
}
