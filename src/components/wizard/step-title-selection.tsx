"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Title templates (name + theme only, no specific details) ───

type TitleFn = (name: string) => string;

const THEME_TITLES: Record<string, TitleFn[]> = {
  adventure: [
    (n) => `${n}'s Big Adventure`,
    (n) => `${n}'s Secret Quest`,
    (n) => `The Adventures of ${n}`,
    (n) => `${n} and the Hidden Treasure`,
    (n) => `${n} Finds the Way`,
    (n) => `${n}'s Daring Journey`,
    (n) => `${n}'s Greatest Adventure`,
    (n) => `${n} and the Lost Map`,
  ],
  friendship: [
    (n) => `${n}'s New Best Friend`,
    (n) => `${n} Makes a Friend`,
    (n) => `A Friend for ${n}`,
    (n) => `Friends Like ${n}`,
    (n) => `${n} and the Friendship Tree`,
    (n) => `${n}'s Kindest Day`,
    (n) => `${n} Shares the Fun`,
    (n) => `${n}'s Circle of Friends`,
  ],
  space: [
    (n) => `${n} Goes to Space`,
    (n) => `Captain ${n}'s Mission`,
    (n) => `Astronaut ${n}`,
    (n) => `${n} Among the Stars`,
    (n) => `${n}'s Cosmic Journey`,
    (n) => `${n}'s Rocket Ride`,
    (n) => `${n} Reaches the Moon`,
    (n) => `${n} and the Starry Sky`,
  ],
  "enchanted-forest": [
    (n) => `${n}'s Enchanted Forest`,
    (n) => `${n} and the Magic Woods`,
    (n) => `${n}'s Magical Path`,
    (n) => `${n} and the Talking Trees`,
    (n) => `Deep in ${n}'s Forest`,
    (n) => `${n}'s Woodland Wonder`,
    (n) => `The Secret Forest of ${n}`,
    (n) => `${n} and the Forest Spell`,
  ],
  superheroes: [
    (n) => `Super ${n} Saves the Day`,
    (n) => `${n}'s Super Powers`,
    (n) => `The Amazing ${n}`,
    (n) => `${n} to the Rescue`,
    (n) => `The Mighty ${n}`,
    (n) => `${n}'s Secret Power`,
    (n) => `Hero ${n}'s Big Day`,
    (n) => `${n}: Tiny Superhero`,
  ],
  "fairy-tale": [
    (n) => `Once Upon a ${n}`,
    (n) => `${n}'s Fairy Tale`,
    (n) => `The Tale of ${n}`,
    (n) => `${n}'s Enchanted Story`,
    (n) => `${n}'s Castle of Dreams`,
    (n) => `A Fairy Tale for ${n}`,
    (n) => `The Magic of ${n}`,
    (n) => `${n}'s Storybook Kingdom`,
  ],
};

const GENERIC_TITLES: TitleFn[] = [
  (n) => `A Story About ${n}`,
  (n) => `${n}'s Special Day`,
  (n) => `The World of ${n}`,
  (n) => `${n}'s Amazing Story`,
  (n) => `${n}'s Wonderful Day`,
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateTitles(name: string, theme: string): string[] {
  const themePool = THEME_TITLES[theme] || [];
  const pool = [...themePool, ...GENERIC_TITLES];
  return pickRandom(pool, 3).map((fn) => fn(name));
}

// ─── Component ───

export function StepTitleSelection() {
  const {
    selectedTitle,
    setSelectedTitle,
    titleOptions,
    setTitleOptions,
    childName,
    theme,
    nextStep,
    prevStep,
  } = useWizardStore();

  useEffect(() => {
    if (titleOptions.length > 0) return;
    setTitleOptions(generateTitles(childName, theme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShuffle() {
    setSelectedTitle("");
    setTitleOptions(generateTitles(childName, theme));
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
        onClick={handleShuffle}
        className="text-sm text-primary hover:underline w-full text-center"
      >
        Shuffle suggestions
      </button>

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
