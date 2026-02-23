"use client";

import { motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AGE_OPTIONS = [3, 4, 5, 6, 7, 8];
const GENDER_OPTIONS = [
  { value: "boy", label: "Boy", icon: "👦" },
  { value: "girl", label: "Girl", icon: "👧" },
  { value: "non-binary", label: "They/Them", icon: "🧒" },
];

export function StepChildInfo() {
  const { childName, childAge, childGender, setChildName, setChildAge, setChildGender, nextStep } =
    useWizardStore();

  const isValid = childName.trim().length > 0 && childAge !== null && childGender !== "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Who is this book for?
        </h2>
        <p className="text-muted-foreground mt-2">Tell us about the little star of the story</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Child&apos;s First Name</label>
          <Input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Enter their name..."
            className="text-lg h-14"
            maxLength={30}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Age</label>
          <div className="flex gap-3">
            {AGE_OPTIONS.map((age) => (
              <button
                key={age}
                onClick={() => setChildAge(age)}
                className={cn(
                  "w-14 h-14 rounded-xl text-lg font-bold transition-all duration-200",
                  childAge === age
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Pronouns</label>
          <div className="grid grid-cols-3 gap-3">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setChildGender(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200",
                  childGender === option.value
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-sm font-semibold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={nextStep} disabled={!isValid} size="xl" className="w-full">
        Continue
      </Button>
    </motion.div>
  );
}
