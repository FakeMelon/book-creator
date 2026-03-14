"use client";

import { useTranslations, useLocale } from "next-intl";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ILLUSTRATION_STYLES, BOOK_LANGUAGES } from "@/constants";
import { cn } from "@/lib/utils";
import type { IllustrationStyle, StoryStyle } from "@/types";

export function StepStoryStyle() {
  const {
    storyStyle,
    illustrationStyle,
    dedication,
    bookLanguage,
    setStoryStyle,
    setIllustrationStyle,
    setDedication,
    setBookLanguage,
    nextStep,
  } = useWizardStore();
  const t = useTranslations("Wizard.style");
  const tc = useTranslations("Common");
  const ts = useTranslations("Constants.styles");
  const locale = useLocale();

  // Default to UI locale if no language selected
  const effectiveLanguage = bookLanguage || locale;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
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
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ILLUSTRATION_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setIllustrationStyle(style.id as IllustrationStyle)}
              className={cn(
                "flex flex-col items-center gap-1 pb-2 rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                illustrationStyle === style.id
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-transparent bg-muted/60 hover:bg-muted"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={style.previewImage}
                alt={ts(`${style.id}.name`)}
                className="w-full aspect-square object-contain"
              />
              <p className="text-xs font-bold text-center px-1">{ts(`${style.id}.name`)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Book Language */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          {t("bookLanguageLabel")}
        </label>
        <p className="text-xs text-muted-foreground mb-3">{t("bookLanguageHint")}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {BOOK_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setBookLanguage(lang.code)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm",
                effectiveLanguage === lang.code
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              <span>{lang.flag}</span>
              <span className="font-medium truncate">{lang.nativeName}</span>
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
    </div>
  );
}
