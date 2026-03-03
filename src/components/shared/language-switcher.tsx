"use client";

import { useRef, useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const LOCALES = [
  { code: "en", label: "english" },
  { code: "he", label: "hebrew" },
] as const;

export interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps = {}) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSwitch(newLocale: string) {
    setOpen(false);
    if (newLocale === locale) return;

    router.replace(pathname, { locale: newLocale });

    fetch("/api/user/locale", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    }).catch((err) => {
      console.error("Failed to persist locale preference:", err);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer ${className ?? "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">
          {locale === "he" ? t("hebrew") : t("english")}
        </span>
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-1 w-36 rounded-lg border bg-white shadow-md z-50 overflow-hidden">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSwitch(code)}
              className={`w-full px-3 py-2 text-start text-sm transition-colors cursor-pointer ${
                code === locale
                  ? "bg-primary/5 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
