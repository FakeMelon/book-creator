"use client";

import { ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useTypewriter } from "@/hooks/use-typewriter";
import { AddCustomInput, CustomBadge } from "./creative-helpers";
import { cn } from "@/lib/utils";

export interface SentenceConfig {
  key: string;
  field: string;
  mode: "single" | "multi";
  max: number;
  required: boolean;
  presets: { id: string; emoji: string }[];
  translationCategory: string;
  customPlaceholder: string;
}

interface TypewriterSentenceProps {
  config: SentenceConfig;
  sentenceTemplate: string;
  isActive: boolean;
  isCompleted: boolean;
  isReactivated: boolean;
  isExiting?: boolean;
  skipAnimation: boolean;
  selectedValues: string[];
  customValues: string[];
  onToggle: (value: string) => void;
  onAddCustom: (value: string) => void;
  onRemoveCustom: (value: string) => void;
  onSetSingle: (value: string) => void;
  onDone: () => void;
  onSkip: () => void;
  onReactivate: () => void;
  renderPresets?: (props: {
    selectedValues: string[];
    onToggle: (value: string) => void;
    onSetSingle: (value: string) => void;
    mode: "single" | "multi";
    disabled: boolean;
  }) => ReactNode;
}

const BLANK_SENTINEL = "___";

function getContainerVariants(isEdit: boolean) {
  return {
    hidden: { opacity: 0, y: isEdit ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, staggerChildren: isEdit ? 0 : 0.02 },
    },
  };
}

const chipVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

function splitTemplate(template: string): { before: string; after: string } {
  const idx = template.indexOf(BLANK_SENTINEL);
  if (idx === -1) return { before: template, after: "" };
  return {
    before: template.slice(0, idx),
    after: template.slice(idx + BLANK_SENTINEL.length),
  };
}

const NESTED_CATEGORIES = new Set(["themes"]);

function formatValues(
  values: string[],
  tConst: (key: string) => string,
  category: string,
  presetIds: Set<string>
): string {
  const suffix = NESTED_CATEGORIES.has(category) ? ".name" : "";
  const labels = values.map((v) => {
    // Only translate known preset IDs; custom values are used as-is
    if (!presetIds.has(v)) return v;
    try {
      return tConst(`${category}.${v}${suffix}`);
    } catch (err) {
      console.error(`[TypewriterSentence] Failed to translate "${category}.${v}${suffix}":`, err);
      return v;
    }
  });
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} & ${labels[1]}`;
  return labels.slice(0, -1).join(", ") + " & " + labels[labels.length - 1];
}

export function TypewriterSentence({
  config,
  sentenceTemplate,
  isActive,
  isCompleted,
  skipAnimation,
  selectedValues,
  customValues,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  onSetSingle,
  onDone,
  onSkip,
  onReactivate,
  isReactivated,
  isExiting,
  renderPresets,
}: TypewriterSentenceProps) {
  const t = useTranslations("Wizard.creative");
  const tc = useTranslations("Common");
  const tConst = useTranslations("Constants");

  const allValues = [...selectedValues, ...customValues];
  const total = allValues.length;
  const atMax = total >= config.max;
  const presetIds = useMemo(() => new Set(config.presets.map((p) => p.id)), [config.presets]);

  // Build the full text for typewriter (replace {blank} with sentinel)
  const templateWithSentinel = sentenceTemplate.replace("{blank}", BLANK_SENTINEL);
  const { before, after } = splitTemplate(templateWithSentinel);
  const fullText = before + BLANK_SENTINEL + after;
  const blankStart = before.length;
  const blankEnd = blankStart + BLANK_SENTINEL.length;

  const shouldAnimate = isActive && !skipAnimation;
  const { displayedText, isComplete: typewriterDone } = useTypewriter({
    text: fullText,
    speed: 35,
    enabled: shouldAnimate,
  });

  // Determine how much of each segment has been revealed
  const cursorPos = shouldAnimate ? displayedText.length : fullText.length;
  const displayBefore = fullText.slice(0, Math.min(cursorPos, blankStart));
  const blankRevealed = cursorPos > blankStart;
  const displayAfter = cursorPos > blankEnd ? fullText.slice(blankEnd, cursorPos) : "";
  const showInput = isActive && !isExiting && (skipAnimation || typewriterDone);
  const isStillTyping = shouldAnimate && !typewriterDone;

  // Derived states for unified rendering
  const isSkipped = !isActive && !isCompleted && allValues.length === 0 && !config.required;
  const isDone = (isCompleted && !isActive) || isSkipped;
  // visuallyDone: looks completed even while still technically active (during exit transition)
  const visuallyDone = isDone || !!isExiting;

  return (
    <motion.div
      initial={skipAnimation ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "transition-[padding] duration-300 ease-in-out",
        visuallyDone ? "py-2 group cursor-pointer" : "py-3",
      )}
      onClick={isDone ? onReactivate : undefined}
    >
      {/* Sentence text row */}
      <div className={cn(
        "flex items-start transition-colors duration-300",
        isCompleted && !isActive && "text-muted-foreground group-hover:text-foreground",
        isSkipped && "text-muted-foreground/50 group-hover:text-muted-foreground",
      )}>
        {/* Status icon: animated width from 0→w-5 on completion */}
        <span
          className={cn(
            "shrink-0 text-center leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
            visuallyDone ? "w-5 me-2 opacity-100" : "w-0 me-0 opacity-0",
            !isSkipped && visuallyDone && "text-primary",
          )}
          aria-hidden={!visuallyDone}
        >
          {isSkipped ? "—" : "\u2713"}
        </span>

        <p className={cn(
          "leading-relaxed transition-all duration-300 ease-in-out",
          isActive ? "text-lg font-medium" : "text-base",
          isSkipped && "italic line-through",
        )}>
          {displayBefore}
          {/* Blank area — show once cursor reaches it */}
          {blankRevealed && allValues.length > 0 && (
            <strong className={cn(
              "transition-colors duration-300",
              visuallyDone && !isSkipped
                ? "text-foreground group-hover:text-primary"
                : "text-primary"
            )}>
              {formatValues(allValues, tConst, config.translationCategory, presetIds)}
            </strong>
          )}
          {blankRevealed && allValues.length === 0 && !isSkipped && (
            <span className="inline-block w-24 border-b-2 border-primary/40 mx-1" />
          )}
          {blankRevealed && isSkipped && BLANK_SENTINEL}
          {/* After-blank text */}
          {displayAfter}
          {/* Blinking cursor while still typing */}
          {isStillTyping && (
            <span className="inline-block w-1 h-5 bg-primary animate-pulse align-text-bottom" />
          )}
        </p>
      </div>

      {/* Chip area */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            variants={getContainerVariants(isReactivated)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="mt-4 space-y-3"
          >
            {/* Presets */}
            {renderPresets ? (
              renderPresets({
                selectedValues,
                onToggle,
                onSetSingle,
                mode: config.mode,
                disabled: atMax,
              })
            ) : (
              <div className="flex flex-wrap gap-2">
                {config.presets.map((preset) => {
                  const isSelected = selectedValues.includes(preset.id);
                  return (
                    <motion.button
                      key={preset.id}
                      variants={chipVariants}
                      type="button"
                      onClick={() => {
                        if (config.mode === "single") {
                          onSetSingle(preset.id);
                        } else {
                          onToggle(preset.id);
                        }
                      }}
                      disabled={config.mode === "multi" && atMax && !isSelected}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40"
                      )}
                    >
                      <span>{preset.emoji}</span>
                      <span>{tConst(`${config.translationCategory}.${preset.id}${NESTED_CATEGORIES.has(config.translationCategory) ? ".name" : ""}`)}</span>
                    </motion.button>
                  );
                })}
                {/* Custom value badges */}
                {customValues.map((val) => (
                  <CustomBadge
                    key={val}
                    label={val}
                    onRemove={() => onRemoveCustom(val)}
                  />
                ))}
                {/* Custom badge for single-select non-preset values */}
                {config.mode === "single" &&
                  selectedValues.length > 0 &&
                  !config.presets.some((p) => p.id === selectedValues[0]) && (
                    <CustomBadge
                      label={selectedValues[0]}
                      onRemove={() => onSetSingle("")}
                    />
                  )}
              </div>
            )}

            {/* Custom input */}
            <AddCustomInput
              placeholder={config.customPlaceholder}
              onAdd={(val) => {
                if (config.mode === "single") {
                  onSetSingle(val);
                } else {
                  onAddCustom(val);
                }
              }}
              disabled={atMax}
              addLabel={tc("add")}
              addAllLabel={tc("addAll")}
              multipleItemsSuggestion={t("multipleItemsSuggestion")}
              invalidHint={tc("invalidCustomTag")}
            />

            {/* Done / Skip buttons */}
            <div className="flex items-center gap-3 pt-1">
              {/* Done button: for multi-select always, for single-select only when reactivated */}
              {(config.mode === "multi" || isReactivated) && (
                <button
                  type="button"
                  onClick={onDone}
                  disabled={config.required && total === 0}
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  {t("doneButton")}
                </button>
              )}
              {/* Skip button for any optional sentence */}
              {!config.required && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  {t("skipLink")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
