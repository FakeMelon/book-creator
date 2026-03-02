"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export const MULTI_CONCEPT_PATTERN = /\s+(and|or|&)\s+|[,;\/]/i;

/** Lightweight sanity check for custom tag input (language-agnostic). */
export function isValidCustomTag(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  // Must contain at least 2 letters (any Unicode script)
  const letters = trimmed.match(/\p{L}/gu);
  return !!letters && letters.length >= 2;
}

export function detectMultiConcept(text: string): string[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parts = trimmed
    .split(/\s+(?:and|or|&)\s+|[,;\/]/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : null;
}

export function AddCustomInput({
  placeholder,
  onAdd,
  disabled,
  addLabel,
  addAllLabel,
  multipleItemsSuggestion,
  invalidHint,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  disabled?: boolean;
  addLabel: string;
  addAllLabel: string;
  multipleItemsSuggestion: string;
  invalidHint: string;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  const trimmed = value.trim();
  const hasInput = trimmed.length > 0;
  const valid = !hasInput || isValidCustomTag(trimmed);

  function handleChange(text: string): void {
    setValue(text);
    if (MULTI_CONCEPT_PATTERN.test(text)) {
      setSuggestions(detectMultiConcept(text));
    } else {
      setSuggestions(null);
    }
  }

  function handleAdd(): void {
    if (trimmed && isValidCustomTag(trimmed)) {
      onAdd(trimmed);
      setValue("");
      setSuggestions(null);
    }
  }

  function handleAddAll(parts: string[]): void {
    for (const part of parts) {
      if (isValidCustomTag(part)) onAdd(part);
    }
    setValue("");
    setSuggestions(null);
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={30}
          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !hasInput || !valid}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {addLabel}
        </button>
      </div>
      {hasInput && !valid && (
        <p className="text-xs text-destructive">{invalidHint}</p>
      )}

      {suggestions && suggestions.length > 1 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-muted-foreground font-medium">
            {multipleItemsSuggestion}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((part, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isValidCustomTag(part)) onAdd(part);
                  const remaining = suggestions.filter((_, j) => j !== i);
                  if (remaining.length <= 1) {
                    setValue(remaining[0] ?? "");
                    setSuggestions(null);
                  } else {
                    setSuggestions(remaining);
                    setValue(remaining.join(", "));
                  }
                }}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                + {part}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleAddAll(suggestions)}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {addAllLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-lg scale-105"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ms-0.5 hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
      >
        x
      </button>
    </motion.span>
  );
}
