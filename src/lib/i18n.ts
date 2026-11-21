import { i18n } from "astro:config/server";
import { toCodes } from "astro:i18n";
import type { LanguageMetadata } from "./language-recommendations";

export const langs = toCodes(i18n!.locales);
export const locales: Record<string, any> = {};
export const languageMetadata: Record<string, LanguageMetadata> = {};
for (let lang of langs) {
  locales[lang] = (await import(`../../content/${lang}/locale.json`)).default;
  languageMetadata[lang] = (await import(`../../content/${lang}/lang.json`)).default;
}
