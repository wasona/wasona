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
 * Based on the Wikipedia page. Many languages are here to future-proof for new translations.
 * https://en.wikipedia.org/wiki/Quotation_mark#Summary_table_for_all_languages
 *
 * @type {Record<string, string>}
 */
const QUOTES = {
  af: "“”‘’", // Afrikaans
  sq: "„“‘’", // Albanian
  am: "«»‹›", // Amharic
  ar: "«»‹›", // Arabic
  hy: "«»‹›", // Armenian
  az: '“”""', // Azerbaijani
  eu: "«»“”", // Basque
  be: "«»„“", // Belarusian
  bs: "„”’’", // Bosnian
  bg: "„“’’", // Bulgarian
  ca: "«»“”", // Catalan
  zh: "“”‘’", // Chinese, simplified
  zh_TW: "「」『』", // Chinese, traditional
  hr: "„”‘’", // Croatian
  cs: "„“‚‘", // Czech
  da: "»«›‹", // Danish
  nl: "„”‚’", // Dutch
  en: "“”‘’", // English (US, Canada, South Africa) merged into 'en'
  eo: "“”‘’", // Esperanto
  et: "„“„“", // Estonian
  tl_PH: "“”‘’", // Filipino
  fi: "””’’", // Finnish
  fr: "«»“”", // French
  "fr-sw": "«»‹›", // French, Switzerland
  gl: "«»“”", // Galician
  ka: "„“«»", // Georgian
  de: "„“‚‘", // German
  "de-sw": "«»‹›", // Swiss German
  el: "«»“”", // Greek
  he: "””’’", // Hebrew
  hi: "“”‘’", // Hindi
  hu: "„”»«", // Hungarian
  is: "„“‚‘", // Icelandic
  io: "«»‘’", // Ido
  id: "“”‘’", // Indonesian
  ia: "“”‘’", // Interlingua
  ga: "“”‘’", // Irish
  it: "«»“”", // Italian
  ja: "「」『』", // Japanese
  kk: "«»„“", // Kazakh
  kaa: "«»«»", // Karakalpak
  km: "«»«»", // Khmer
  ko: "“”‘’", // South Korean
  lo: "“”‘’", // Lao
  lv: "«»„“", // Latvian
  lt: "„“‚‘", // Lithuanian
  mk: "„“’‘", // Macedonian
  mt: "“”‘’", // Maltese
  mn: "«»„“", // Mongolian, Cyrillic script
  khb: "《》〈〉", // New Tai Lue
  no: "«»‘’", // Norwegian
  oc: "«»“”", // Occitan
  ps: "«»“”", // Pashto
  fa: "«»‘’", // Persian
  pl: "„”»«", // Polish
  pt: "“”‘’", // Portuguese, Brazil (changed from pt-BR)
  "pt-PT": "«»“”", // Portuguese, Portugal
  ro: "„”«»", // Romanian
  rm: "«»‹›", // Romansh
  ru: "«»„“", // Russian
  sr: "„”’’", // Serbian
  gd: "‘’“”", // Scottish Gaelic
  sk: "„“‚‘", // Slovak
  sl: "„“‚‘", // Slovene
  es: "«»“”", // Spanish
  sv: "””’’", // Swedish
  tdd: "《》〈〉", // Tai Le
  bo: "《》〈〉", // Tibetan
  ti: "«»‹›", // Tigrinya
  th: "“”‘’", // Thai
  tr: "“”‘’", // Turkish
  uk: "«»„“", // Ukrainian
  ur: "“”‘’", // Urdu
  ug: "«»‹›", // Uyghur
  uz: "“”‘’", // Uzbek (Latin)
  vi: "“”‘’", // Vietnamese
  cy: "‘’“”", // Welsh
};
