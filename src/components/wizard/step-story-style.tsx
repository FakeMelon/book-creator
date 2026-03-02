"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ILLUSTRATION_STYLES } from "@/constants";
import { cn } from "@/lib/utils";
import type { IllustrationStyle, StoryStyle } from "@/types";

const STYLE_ICONS: Record<string, string> = {
  WATERCOLOR_WHIMSY: "🎨",
  BRIGHT_AND_BOLD: "🌈",
  STORYBOOK_CLASSIC: "📚",
  COZY_AND_WARM: "🕯️",
};

export function StepStoryStyle() {
  const {
    storyStyle,
    illustrationStyle,
    dedication,
    setStoryStyle,
    setIllustrationStyle,
    setDedication,
    nextStep,
  } = useWizardStore();
  const t = useTranslations("Wizard.style");
  const tc = useTranslations("Common");
  const ts = useTranslations("Constants.styles");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">{t("heading")}</h2>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      {/* Prose vs Rhyme */}
      <div>
        <label className="block text-sm font-semibold mb-3">{t("writingLabel")}</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              value: "PROSE" as StoryStyle,
              labelKey: "proseLabel" as const,
              descKey: "proseDesc" as const,
              exampleKey: "proseExample" as const,
            },
            {
              value: "RHYME" as StoryStyle,
              labelKey: "rhymeLabel" as const,
              descKey: "rhymeDesc" as const,
              exampleKey: "rhymeExample" as const,
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStoryStyle(option.value)}
              className={cn(
                "text-start p-5 rounded-xl transition-all duration-200 border-2",
                storyStyle === option.value
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-transparent bg-muted hover:bg-muted/80"
              )}
            >
              <p className="font-bold text-lg">{t(option.labelKey)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t(option.descKey)}</p>
              <p className="text-xs italic text-muted-foreground mt-3 border-s-2 border-primary/30 ps-3">
                {t(option.exampleKey)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Illustration Style */}
      <div>
        <label className="block text-sm font-semibold mb-3">{t("illustrationLabel")}</label>
        <div className="grid grid-cols-2 gap-4">
          {ILLUSTRATION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setIllustrationStyle(style.id as IllustrationStyle)}
              className={cn(
                "text-start p-5 rounded-xl transition-all duration-200 border-2",
                illustrationStyle === style.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-transparent bg-muted hover:bg-muted/80"
              )}
            >
              <div className="w-full h-24 rounded-lg bg-gradient-to-br from-muted to-muted/50 mb-3 flex items-center justify-center text-4xl">
                {STYLE_ICONS[style.id]}
              </div>
              <p className="font-bold">{ts(`${style.id}.name`)}</p>
              <p className="text-sm text-muted-foreground mt-1">{ts(`${style.id}.description`)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dedication */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          {t("dedicationLabel")}{" "}
          <span className="text-muted-foreground font-normal">{t("optional")}</span>
        </label>
        <Input
          value={dedication}
          onChange={(e) => setDedication(e.target.value)}
          placeholder={t("dedicationPlaceholder")}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("charCounter", { count: dedication.length })}
        </p>
      </div>

      <Button onClick={nextStep} size="lg" className="w-full">
        {tc("continue")}
      </Button>
    </motion.div>
  );
}
