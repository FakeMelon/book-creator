"use client";

import { useTranslations } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AGE_RANGE_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "boy", labelKey: "genderBoy" as const, icon: "👦" },
  { value: "girl", labelKey: "genderGirl" as const, icon: "👧" },
  { value: "non-binary", labelKey: "genderNonBinary" as const, icon: "🧒" },
];

export function StepChildInfo() {
  const { childName, childAge, childGender, setChildName, setChildAge, setChildGender, nextStep } =
    useWizardStore();
  const t = useTranslations("Wizard.childInfo");
  const tc = useTranslations("Common");
  const tConst = useTranslations("Constants");

  const isValid = childName.trim().length > 0 && childAge !== "" && childGender !== "";

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">
          {t("heading")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">{t("nameLabel")}</label>
          <Input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="text-lg h-14"
            maxLength={30}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">{t("ageLabel")}</label>
          <div className="grid grid-cols-2 gap-3">
            {AGE_RANGE_OPTIONS.map((range) => (
              <button
                key={range.id}
                onClick={() => setChildAge(range.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl transition-all duration-200",
                  childAge === range.id
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                <span className="text-2xl">{range.emoji}</span>
                <div className="text-start">
                  <span className="font-bold">{tConst(`ageRanges.${range.id}.label`)}</span>
                  <p className={cn(
                    "text-xs mt-0.5",
                    childAge === range.id ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {tConst(`ageRanges.${range.id}.name`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">{t("pronounsLabel")}</label>
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
                <span className="text-sm font-semibold">{t(option.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={nextStep} disabled={!isValid} size="xl" className="w-full">
        {tc("continue")}
      </Button>
    </div>
  );
}
