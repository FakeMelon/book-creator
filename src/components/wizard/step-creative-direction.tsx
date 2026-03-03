"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { useShallow } from "zustand/react/shallow";
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
import { TypewriterSentence, type SentenceConfig } from "./typewriter-sentence";

// ─── Sentence definitions ───

const SENTENCE_CONFIGS: SentenceConfig[] = [
  {
    key: "occasion",
    field: "occasion",
    mode: "single",
    max: 1,
    required: true,
    presets: OCCASION_OPTIONS,
    translationCategory: "occasions",
    customPlaceholder: "",
  },
  {
    key: "theme",
    field: "theme",
    mode: "single",
    max: 1,
    required: true,
    presets: THEMES.map((t) => ({ id: t.id, emoji: t.icon })),
    translationCategory: "themes",
    customPlaceholder: "",
  },
  {
    key: "traits",
    field: "personalityTraits",
    mode: "multi",
    max: 3,
    required: true,
    presets: PERSONALITY_TRAITS,
    translationCategory: "traits",
    customPlaceholder: "",
  },
  {
    key: "hobbies",
    field: "hobbies",
    mode: "multi",
    max: 5,
    required: true,
    presets: HOBBY_OPTIONS,
    translationCategory: "hobbies",
    customPlaceholder: "",
  },
  {
    key: "animals",
    field: "favoriteAnimal",
    mode: "multi",
    max: 3,
    required: false,
    presets: ANIMAL_OPTIONS,
    translationCategory: "animals",
    customPlaceholder: "",
  },
  {
    key: "foods",
    field: "favoriteFoods",
    mode: "multi",
    max: 3,
    required: false,
    presets: FOOD_OPTIONS,
    translationCategory: "foods",
    customPlaceholder: "",
  },
];

// ─── Helpers ───

interface StoreSnapshot {
  occasion: string;
  theme: string;
  personalityTraits: string[];
  customPersonalityTraits: string[];
  hobbies: string[];
  customHobbies: string[];
  favoriteAnimal: string[];
  customFavoriteAnimals: string[];
  favoriteFoods: string[];
  customFavoriteFoods: string[];
}

const VALID_GENDERS = new Set(["boy", "girl", "non-binary"]);

function getPronouns(
  gender: string,
  t: (key: string) => string
): { pronoun: string; possessive: string } {
  const genderKey = VALID_GENDERS.has(gender) ? gender : "non-binary";
  return {
    pronoun: t(`pronouns.${genderKey}.subject`),
    possessive: t(`pronouns.${genderKey}.possessive`),
  };
}

function getSentenceValues(
  config: SentenceConfig,
  store: StoreSnapshot
): { selected: string[]; custom: string[] } {
  switch (config.field) {
    case "occasion":
      return { selected: store.occasion ? [store.occasion] : [], custom: [] };
    case "theme":
      return { selected: store.theme ? [store.theme] : [], custom: [] };
    case "personalityTraits":
      return { selected: store.personalityTraits, custom: store.customPersonalityTraits };
    case "hobbies":
      return { selected: store.hobbies, custom: store.customHobbies };
    case "favoriteAnimal":
      return { selected: store.favoriteAnimal, custom: store.customFavoriteAnimals };
    case "favoriteFoods":
      return { selected: store.favoriteFoods, custom: store.customFavoriteFoods };
    default:
      return { selected: [], custom: [] };
  }
}

function isSentenceFilled(
  config: SentenceConfig,
  store: StoreSnapshot
): boolean {
  const { selected, custom } = getSentenceValues(config, store);
  return selected.length + custom.length > 0;
}

function computeInitialActiveSentence(
  store: StoreSnapshot
): number {
  for (let i = 0; i < SENTENCE_CONFIGS.length; i++) {
    if (!isSentenceFilled(SENTENCE_CONFIGS[i], store)) return i;
  }
  return SENTENCE_CONFIGS.length;
}

// ─── Component ───

export function StepCreativeDirection() {
  const store = useWizardStore(useShallow((s) => ({
    childName: s.childName,
    childGender: s.childGender,
    occasion: s.occasion,
    theme: s.theme,
    personalityTraits: s.personalityTraits,
    customPersonalityTraits: s.customPersonalityTraits,
    hobbies: s.hobbies,
    customHobbies: s.customHobbies,
    favoriteAnimal: s.favoriteAnimal,
    customFavoriteAnimals: s.customFavoriteAnimals,
    favoriteFoods: s.favoriteFoods,
    customFavoriteFoods: s.customFavoriteFoods,
    nextStep: s.nextStep,
    setOccasion: s.setOccasion,
    setTheme: s.setTheme,
    togglePersonalityTrait: s.togglePersonalityTrait,
    addCustomPersonalityTrait: s.addCustomPersonalityTrait,
    removeCustomPersonalityTrait: s.removeCustomPersonalityTrait,
    toggleHobby: s.toggleHobby,
    addCustomHobby: s.addCustomHobby,
    removeCustomHobby: s.removeCustomHobby,
    toggleFavoriteAnimal: s.toggleFavoriteAnimal,
    addCustomFavoriteAnimal: s.addCustomFavoriteAnimal,
    removeCustomFavoriteAnimal: s.removeCustomFavoriteAnimal,
    toggleFavoriteFood: s.toggleFavoriteFood,
    addCustomFavoriteFood: s.addCustomFavoriteFood,
    removeCustomFavoriteFood: s.removeCustomFavoriteFood,
  })));
  const t = useTranslations("Wizard.creative");
  const tc = useTranslations("Common");
  const tConst = useTranslations("Constants");

  const { childName, childGender, nextStep } = store;

  const { pronoun, possessive } = getPronouns(childGender, t);

  // Compute which sentences were already filled on mount (intentionally run once)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialActive = useMemo(() => computeInitialActiveSentence(store), []);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(initialActive);
  const [reactivatedIndex, setReactivatedIndex] = useState<number | null>(null);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [reachedEnd, setReachedEnd] = useState(initialActive >= SENTENCE_CONFIGS.length);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nestedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animatedSentences = useRef<Set<number>>(
    new Set(Array.from({ length: initialActive }, (_, i) => i))
  );
  // When returning (initialActive > 0), skip animation for all sentences that existed at mount
  const skipInitialAnimation = initialActive > 0;

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (nestedTimerRef.current) clearTimeout(nestedTimerRef.current);
    };
  }, []);

  // Populate placeholders from translations
  const placeholderMap: Record<string, string> = {
    occasion: t("occasionPlaceholder"),
    theme: "",
    traits: t("traitsPlaceholder"),
    hobbies: t("hobbiesPlaceholder"),
    animals: t("animalsPlaceholder"),
    foods: t("foodsPlaceholder"),
  };
  const sentenceConfigs = useMemo(() => {
    return SENTENCE_CONFIGS.map((cfg) => ({
      ...cfg,
      customPlaceholder: placeholderMap[cfg.key] ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const genderKey = VALID_GENDERS.has(childGender) ? childGender : "non-binary";

  // Resolve sentence template text with interpolated names/pronouns
  const getSentenceTemplate = useCallback(
    (key: string) => {
      return t(`sentences.${key}` as any, {
        childName: childName || "your child",
        blank: "{blank}",
        pronoun,
        possessive,
        gender: genderKey,
      });
    },
    [t, childName, pronoun, possessive, genderKey]
  );

  // Advance to the next sentence with exit transition
  const advanceTo = useCallback(
    (nextIndex: number) => {
      // Clear any pending exit timer
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

      animatedSentences.current.add(activeSentenceIndex);
      setReactivatedIndex(null);
      // Phase 1: mark current sentence as exiting (chips fade out, text transitions)
      setExitingIndex(activeSentenceIndex);
      // Phase 2: after exit animation completes, activate the next sentence
      exitTimerRef.current = setTimeout(() => {
        setExitingIndex(null);
        setActiveSentenceIndex(nextIndex);
        if (nextIndex >= SENTENCE_CONFIGS.length) {
          // Let the last sentence settle before revealing nav buttons
          nestedTimerRef.current = setTimeout(() => setReachedEnd(true), 200);
        }
      }, 300);
    },
    [activeSentenceIndex]
  );

  const handleDone = useCallback(
    (sentenceIndex: number) => {
      advanceTo(sentenceIndex + 1);
    },
    [advanceTo]
  );

  const handleSkip = useCallback(
    (sentenceIndex: number) => {
      advanceTo(sentenceIndex + 1);
    },
    [advanceTo]
  );

  const handleReactivate = useCallback((sentenceIndex: number) => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    // If there's currently an active sentence with chips showing, exit first
    if (activeSentenceIndex < SENTENCE_CONFIGS.length) {
      animatedSentences.current.add(activeSentenceIndex);
      setExitingIndex(activeSentenceIndex);
      exitTimerRef.current = setTimeout(() => {
        setExitingIndex(null);
        setReactivatedIndex(sentenceIndex);
        setActiveSentenceIndex(sentenceIndex);
      }, 300);
    } else {
      setReactivatedIndex(sentenceIndex);
      setActiveSentenceIndex(sentenceIndex);
    }
  }, [activeSentenceIndex]);

  // Single-select: auto-advance on first fill, just set value when reactivated
  const handleSingleSelect = useCallback(
    (sentenceIndex: number, setter: (val: string) => void, value: string) => {
      setter(value);
      if (reactivatedIndex !== sentenceIndex) {
        // Short delay for visual feedback (chip highlights), then advanceTo adds its own exit delay
        setTimeout(() => advanceTo(sentenceIndex + 1), 150);
      }
    },
    [advanceTo, reactivatedIndex]
  );

  // Check if all required sentences are filled
  const allRequiredFilled = SENTENCE_CONFIGS.every(
    (cfg) => !cfg.required || isSentenceFilled(cfg, store)
  );

  // Build store action maps per sentence
  const getActions = useCallback(
    (config: SentenceConfig, sentenceIndex: number) => {
      switch (config.field) {
        case "occasion":
          return {
            onToggle: () => {},
            onAddCustom: () => {},
            onRemoveCustom: () => {},
            onSetSingle: (val: string) =>
              handleSingleSelect(sentenceIndex, store.setOccasion, val),
          };
        case "theme":
          return {
            onToggle: () => {},
            onAddCustom: () => {},
            onRemoveCustom: () => {},
            onSetSingle: (val: string) =>
              handleSingleSelect(sentenceIndex, store.setTheme, val),
          };
        case "personalityTraits":
          return {
            onToggle: store.togglePersonalityTrait,
            onAddCustom: store.addCustomPersonalityTrait,
            onRemoveCustom: store.removeCustomPersonalityTrait,
            onSetSingle: () => {},
          };
        case "hobbies":
          return {
            onToggle: store.toggleHobby,
            onAddCustom: store.addCustomHobby,
            onRemoveCustom: store.removeCustomHobby,
            onSetSingle: () => {},
          };
        case "favoriteAnimal":
          return {
            onToggle: store.toggleFavoriteAnimal,
            onAddCustom: store.addCustomFavoriteAnimal,
            onRemoveCustom: store.removeCustomFavoriteAnimal,
            onSetSingle: () => {},
          };
        case "favoriteFoods":
          return {
            onToggle: store.toggleFavoriteFood,
            onAddCustom: store.addCustomFavoriteFood,
            onRemoveCustom: store.removeCustomFavoriteFood,
            onSetSingle: () => {},
          };
        default:
          return {
            onToggle: () => {},
            onAddCustom: () => {},
            onRemoveCustom: () => {},
            onSetSingle: () => {},
          };
      }
    },
    [store, handleSingleSelect]
  );

  // Custom theme card renderer for the theme sentence
  const renderThemePresets = useCallback(
    ({
      selectedValues,
      onSetSingle,
    }: {
      selectedValues: string[];
      onToggle: (value: string) => void;
      onSetSingle: (value: string) => void;
      mode: "single" | "multi";
      disabled: boolean;
    }) => (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((themeOption) => (
          <motion.button
            key={themeOption.id}
            variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } }}
            type="button"
            onClick={() => onSetSingle(themeOption.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 border-2",
              selectedValues.includes(themeOption.id)
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
          </motion.button>
        ))}
      </div>
    ),
    [tConst]
  );

  return (
    <div className="space-y-2 max-w-2xl mx-auto px-1">
      {/* Sentence stack */}
      <div className="min-h-[300px] space-y-1 py-2">
        {sentenceConfigs.map((config, i) => {
          const isActive = i === activeSentenceIndex;
          const { selected, custom } = getSentenceValues(config, store);
          const isCompleted = !isActive && (selected.length + custom.length > 0);
          const isPast = i < activeSentenceIndex;
          const isFuture = i > activeSentenceIndex;

          // Don't render future sentences
          if (isFuture && !isCompleted) return null;

          const actions = getActions(config, i);
          const template = getSentenceTemplate(config.key);

          return (
            <TypewriterSentence
              key={config.key}
              config={config}
              sentenceTemplate={template}
              isActive={isActive}
              isCompleted={isCompleted || (isPast && !isActive)}
              isReactivated={isActive && reactivatedIndex === i}
              isExiting={exitingIndex === i}
              skipAnimation={(i <= initialActive && skipInitialAnimation) || animatedSentences.current.has(i)}
              selectedValues={selected}
              customValues={custom}
              onToggle={actions.onToggle}
              onAddCustom={actions.onAddCustom}
              onRemoveCustom={actions.onRemoveCustom}
              onSetSingle={actions.onSetSingle}
              onDone={() => handleDone(i)}
              onSkip={() => handleSkip(i)}
              onReactivate={() => handleReactivate(i)}
              renderPresets={config.key === "theme" ? renderThemePresets : undefined}
            />
          );
        })}
      </div>

      {/* Navigation — hidden until user has gone through all sentences */}
      {reachedEnd && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-3 pt-4"
        >
          <Button
            onClick={nextStep}
            disabled={!allRequiredFilled}
            size="lg"
            className="w-full"
          >
            {tc("nextStep")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
