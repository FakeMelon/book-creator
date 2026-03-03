"use client";

import { useTranslations } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AGE_OPTIONS = [3, 4, 5, 6, 7, 8];
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

  const isValid = childName.trim().length > 0 && childAge !== null && childGender !== "";

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
