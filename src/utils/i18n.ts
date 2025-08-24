import fs from "fs";
import path from "path";

export const langNames: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  pl: "polski",
  ru: "русский",
  he: "עברית",
  translate: "add language",
};
export const langs = Object.keys(langNames);
export const locales = Object.fromEntries(
  langs
    .map((lang) => [lang, path.join("content", lang, "locale.json")])
    .filter(([lang, localePath]) => fs.existsSync(localePath))
    .map(([lang, localePath]) => [lang, fs.readFileSync(localePath, "utf-8")])
    .map(([lang, locale]) => [lang, JSON.parse(locale)]),
);
