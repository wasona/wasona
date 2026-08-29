import { i18n } from "astro:config/server";
import { toCodes } from "astro:i18n";

export const langs = toCodes(i18n!.locales);
export const locales: Record<string, any> = {};
for (let lang of langs) {
  locales[lang] = await import(`../../content/${lang}/locale.json`);
}
