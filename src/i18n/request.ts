import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (err) {
    console.error(`[i18n] Failed to load messages for locale "${locale}", falling back to "${routing.defaultLocale}":`, err);
    messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
  }

  return { locale, messages };
});
