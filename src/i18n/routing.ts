import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "he", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: true,
});
