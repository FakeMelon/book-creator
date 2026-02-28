/**
 * English-only label lookups for constants — used when constructing prompts for AI models.
 * These always return English regardless of the user's locale, because the AI models operate in English.
 */

import enMessages from "../../messages/en.json";

const constants = enMessages.Constants;

export function getThemeName(themeId: string): string {
  const theme = constants.themes[themeId as keyof typeof constants.themes];
  if (!theme?.name) {
    console.warn(`[i18n] Missing English label for theme "${themeId}" — using raw ID`);
    return themeId;
  }
  return theme.name;
}

export function getThemeDescription(themeId: string): string {
  const theme = constants.themes[themeId as keyof typeof constants.themes];
  if (!theme?.description) {
    console.warn(`[i18n] Missing English description for theme "${themeId}"`);
    return "";
  }
  return theme.description;
}

export function getStyleName(styleId: string): string {
  const style = constants.styles[styleId as keyof typeof constants.styles];
  if (!style?.name) {
    console.warn(`[i18n] Missing English label for style "${styleId}" — using raw ID`);
    return styleId;
  }
  return style.name;
}

export function getStyleDescription(styleId: string): string {
  const style = constants.styles[styleId as keyof typeof constants.styles];
  if (!style?.description) {
    console.warn(`[i18n] Missing English description for style "${styleId}"`);
    return "";
  }
  return style.description;
}

export function getTraitLabel(traitId: string): string {
  const label = (constants.traits as Record<string, string>)[traitId];
  if (!label) {
    console.warn(`[i18n] Missing English label for trait "${traitId}" — using raw ID`);
    return traitId;
  }
  return label;
}

export function getOccasionLabel(occasionId: string): string {
  const label = (constants.occasions as Record<string, string>)[occasionId];
  if (!label) {
    console.warn(`[i18n] Missing English label for occasion "${occasionId}" — using raw ID`);
    return occasionId;
  }
  return label;
}
