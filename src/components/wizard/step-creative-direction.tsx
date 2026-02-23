"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import {
  THEMES,
  PERSONALITY_TRAITS,
  FAVORITE_THINGS_OPTIONS,
  OCCASION_OPTIONS,
  HOBBY_OPTIONS,
  CHARACTER_OPTIONS,
  ANIMAL_OPTIONS,
} from "@/constants";
import { cn } from "@/lib/utils";

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

  function handleAdd() {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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

export function StepCreativeDirection() {
  const {
    occasion,
    setOccasion,
    favoriteThings,
    customFavoriteThings,
    toggleFavoriteThing,
    addCustomFavoriteThing,
    removeCustomFavoriteThing,
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
    favoriteCharacters,
    customFavoriteCharacters,
    toggleFavoriteCharacter,
    addCustomFavoriteCharacter,
    removeCustomFavoriteCharacter,
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

  const totalFavorites = favoriteThings.length + customFavoriteThings.length;
  const totalTraits = personalityTraits.length + customPersonalityTraits.length;
  const totalHobbies = hobbies.length + customHobbies.length;
  const totalCharacters = favoriteCharacters.length + customFavoriteCharacters.length;
  const totalAnimals = favoriteAnimal.length + customFavoriteAnimals.length;

  const isValid =
    occasion !== "" && totalFavorites >= 1 && totalTraits >= 1 && theme !== "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Creative Direction</h2>
        <p className="text-muted-foreground mt-2">Help us craft the perfect story</p>
      </div>

      {/* Occasion */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Occasion <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASION_OPTIONS.map((occ) => (
            <button
              key={occ}
              onClick={() => setOccasion(occ)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                occasion === occ
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {occ}
            </button>
          ))}
          {/* Show custom occasion as a selected pill if it's not one of the presets */}
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

      {/* Favorite Things */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Favorite Things <span className="text-destructive">*</span>{" "}
          <span className="text-muted-foreground font-normal">({totalFavorites}/5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {FAVORITE_THINGS_OPTIONS.map((thing) => (
            <button
              key={thing}
              onClick={() => toggleFavoriteThing(thing)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                favoriteThings.includes(thing)
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {thing}
            </button>
          ))}
          {customFavoriteThings.map((thing) => (
            <CustomBadge
              key={thing}
              label={thing}
              onRemove={() => removeCustomFavoriteThing(thing)}
            />
          ))}
        </div>
        <AddCustomInput
          placeholder="Add your own..."
          onAdd={addCustomFavoriteThing}
          disabled={totalFavorites >= 5}
        />
      </div>

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
          Hobbies{" "}
          <span className="text-muted-foreground font-normal">(optional, {totalHobbies}/5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {HOBBY_OPTIONS.map((hobby) => (
            <button
              key={hobby}
              onClick={() => toggleHobby(hobby)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                hobbies.includes(hobby)
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {hobby}
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

      {/* Favorite Characters/Heroes */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Favorite Characters / Heroes{" "}
          <span className="text-muted-foreground font-normal">(optional, {totalCharacters}/3)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CHARACTER_OPTIONS.map((char) => (
            <button
              key={char}
              onClick={() => toggleFavoriteCharacter(char)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                favoriteCharacters.includes(char)
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {char}
            </button>
          ))}
          {customFavoriteCharacters.map((char) => (
            <CustomBadge
              key={char}
              label={char}
              onRemove={() => removeCustomFavoriteCharacter(char)}
            />
          ))}
        </div>
        <AddCustomInput
          placeholder="Add your own..."
          onAdd={addCustomFavoriteCharacter}
          disabled={totalCharacters >= 3}
        />
      </div>

      {/* Favorite Animal */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Favorite Animal{" "}
          <span className="text-muted-foreground font-normal">(optional, {totalAnimals}/3)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ANIMAL_OPTIONS.map((animal) => (
            <button
              key={animal}
              onClick={() => toggleFavoriteAnimal(animal)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                favoriteAnimal.includes(animal)
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {animal}
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

      {/* Theme */}
      <div>
        <label className="block text-sm font-semibold mb-3">
          Story Theme <span className="text-destructive">*</span>
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

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid} size="lg" className="flex-[2]">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
