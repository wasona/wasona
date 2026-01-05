// @ts-check

import { visit } from "unist-util-visit";

/**
 * This plugin takes advantage of the fact that it runs after Astro's built-in
 * SmartyPants plugin, and replaces the fancy quotes.
 *
 * @type {import("@astrojs/markdown-remark").RemarkPlugin}
 */
export function i18nQuotes() {
  return (tree, file) => {
    const lang = getLang(file.path);
    if (!lang) return;

    const quotes = QUOTES[lang];
    if (!quotes) return;

    visit(tree, "text", (node) => {
      node.value = node.value
        // use a single pass; avoid replacing single quotes in contractions
        .replaceAll(/“|”|(?<![“”])(?<=\W)‘|’(?=\W)(?![“”])/g, (match) => {
          switch (match) {
            case "“":
              return quotes[0];
            case "”":
              return quotes[1];
            case "‘":
              return quotes[2];
            case "’":
              return quotes[3];
            default:
              throw new Error("unreachable");
          }
        });
    });
  };
}

/**
 * @param {string} path
 * @returns {string | undefined}
 */
function getLang(path) {
  const components = path.split(/[\/\\]/g);
  const i = components.indexOf("content");
  if (i === -1) return undefined;
  return components[i + 1];
}

/**
 * Based on the Wikipedia page.
 * https://en.wikipedia.org/wiki/Quotation_mark#Summary_table_for_all_languages
 *
 * @type {Record<string, string>}
 */
const QUOTES = {
  ar: "«»‹›", // Arabic
  ca: "«»“”", // Catalan
  zh: "“”‘’", // Chinese, simplified
  cs: "„“‚‘", // Czech
  nl: "„”‚’", // Dutch
  eo: "“”‘’", // Esperanto
  // fr: omitted because unicode characters are already used
  de: "„“‚‘", // German
  he: "””’’", // Hebrew
  hu: "„”»«", // Hungarian
  id: "“”‘’", // Indonesian
  ko: "“”‘’", // South Korean
  fa: "«»‘’", // Persian
  pl: "„”»«", // Polish
  pt: "“”‘’", // Portuguese, Brazil
  ru: "«»„“", // Russian
  es: "«»“”", // Spanish
  uk: "«»„“", // Ukrainian
};
