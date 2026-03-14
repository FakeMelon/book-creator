"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AGE_RANGE_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "boy", labelKey: "genderBoy" as const, image: "/images/wizard/gender-boy.png" },
  { value: "girl", labelKey: "genderGirl" as const, image: "/images/wizard/gender-girl.png" },
  { value: "non-binary", labelKey: "genderNonBinary" as const, image: "/images/wizard/gender-non-binary.png" },
];

type SubStep = "name" | "age" | "pronouns";

export function StepChildInfo() {
  const { childName, childAge, childGender, setChildName, setChildAge, setChildGender, nextStep } =
    useWizardStore();
  const t = useTranslations("Wizard.childInfo");
  const tc = useTranslations("Common");
  const tConst = useTranslations("Constants");

  const [subStep, setSubStep] = useState<SubStep>(() => {
    if (!childName.trim()) return "name";
    if (!childAge) return "age";
    return "pronouns";
  });

  const ageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (ageTimerRef.current) clearTimeout(ageTimerRef.current); }, []);

  const goToAge = useCallback(() => setSubStep("age"), []);
  const goToPronouns = useCallback(() => setSubStep("pronouns"), []);

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && childName.trim()) {
      goToAge();
    }
  };

  const handleAgeSelect = (id: string) => {
    setChildAge(id);
    // Small delay so the user sees the selection before advancing
    if (ageTimerRef.current) clearTimeout(ageTimerRef.current);
    ageTimerRef.current = setTimeout(goToPronouns, 200);
  };

  // Summary chips for previous selections
  const summaryItems: { key: string; label: string; onClick: () => void }[] = [];
  if (childName.trim() && subStep !== "name") {
    summaryItems.push({ key: "name", label: childName.trim(), onClick: () => setSubStep("name") });
  }
  if (childAge && subStep !== "age") {
    const ageLabel = tConst(`ageRanges.${childAge}.label`);
    summaryItems.push({ key: "age", label: ageLabel, onClick: () => setSubStep("age") });
  }
  if (childGender && subStep === "pronouns") {
    const genderOption = GENDER_OPTIONS.find((o) => o.value === childGender);
    if (genderOption) {
      summaryItems.push({ key: "pronouns", label: t(genderOption.labelKey), onClick: () => setSubStep("pronouns") });
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">
          {t("heading")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      {/* Summary of previous choices */}
      {summaryItems.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {summaryItems.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {subStep === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <label className="block text-sm font-semibold text-center">{t("nameLabel")}</label>
            <Input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder={t("namePlaceholder")}
              className="text-lg h-14 text-center"
              maxLength={30}
              autoFocus
            />
            <Button onClick={goToAge} disabled={!childName.trim()} size="xl" className="w-full">
              {tc("continue")}
            </Button>
          </motion.div>
        )}

        {subStep === "age" && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <label className="block text-sm font-semibold mb-4 text-center">{t("ageLabel")}</label>
            <div className="grid grid-cols-4 gap-3">
              {AGE_RANGE_OPTIONS.map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleAgeSelect(range.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 pb-2 rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                    childAge === range.id
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-transparent bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Image
                    src={range.image}
                    alt={tConst(`ageRanges.${range.id}.name`)}
                    width={512}
                    height={512}
                    className="w-full aspect-square object-contain"
                  />
                  <span className={cn(
                    "text-base font-bold",
                    childAge === range.id ? "text-primary" : "text-foreground"
                  )}>
                    {tConst(`ageRanges.${range.id}.label`)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {subStep === "pronouns" && (
          <motion.div
            key="pronouns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <label className="block text-sm font-semibold mb-4 text-center">{t("pronounsLabel")}</label>
            <div className="grid grid-cols-3 gap-3 max-w-lg w-full">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setChildGender(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 pb-3 rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                    childGender === option.value
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-transparent bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Image
                    src={option.image}
                    alt={t(option.labelKey)}
                    width={512}
                    height={512}
                    className="w-full aspect-square object-contain"
                  />
                  <span className={cn(
                    "text-base font-bold",
                    childGender === option.value ? "text-primary" : "text-foreground"
                  )}>
                    {t(option.labelKey)}
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={nextStep} disabled={!childGender} size="xl" className="w-full max-w-lg mt-6">
              {tc("continue")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
