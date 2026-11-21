import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { recommendLanguages } from "../src/lib/language-recommendations.ts";
import timeZoneData from "../src/data/timezone-countries.json" with { type: "json" };
import fallbacks from "../src/data/timezone-language-fallbacks.json" with { type: "json" };

const languages = Object.fromEntries(
  readdirSync(new URL("../content/", import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "translate")
    .map((entry) => [
      entry.name,
      JSON.parse(readFileSync(new URL(`../content/${entry.name}/lang.json`, import.meta.url))),
    ]),
);

function recommend(browserLanguages, timeZone, fallbackLanguagesByZone = fallbacks) {
  return recommendLanguages({
    languages,
    constructedLanguages: ["isv", "eo"],
    browserLanguages,
    timeZone,
    countriesByZone: timeZoneData.zones,
    fallbackLanguagesByZone,
    fallbackAliases: timeZoneData.fallbackAliases,
  });
}

test("browser languages take priority and ignore region suffixes", () => {
  assert.deepEqual(recommend(["en-US", "fr-CA", "ru-RU", "tl-PH"], "Asia/Yangon"), [
    "fr", "ru", "tl",
  ]);
});

test("named geographic zones use their specific IANA country", () => {
  assert.deepEqual(timeZoneData.zones["Europe/Berlin"], ["de"]);
  assert.deepEqual(timeZoneData.zones["Europe/Copenhagen"], ["dk"]);
  assert.deepEqual(timeZoneData.zones["Europe/Stockholm"], ["se"]);
  assert.deepEqual(recommend(["en"], "Europe/Berlin"), ["de"]);
  assert.deepEqual(recommend(["en"], "Europe/Copenhagen"), ["da"]);
  assert.deepEqual(recommend(["en"], "Europe/Stockholm"), []);
});

test("Baltic locations do not suggest other countries' languages", () => {
  for (const zone of ["Europe/Tallinn", "Europe/Riga", "Europe/Vilnius"]) {
    assert.deepEqual(recommend(["en"], zone), []);
  }
});

test("Interslavic follows primary Slavic-speaking countries, not Russian fallback regions", () => {
  for (const zone of [
    "Europe/Sarajevo", "Europe/Sofia", "Europe/Minsk", "Europe/Prague",
    "Europe/Zagreb", "Europe/Podgorica", "Europe/Skopje", "Europe/Warsaw",
    "Europe/Belgrade", "Europe/Moscow", "Europe/Ljubljana", "Europe/Bratislava",
    "Europe/Kyiv",
  ]) {
    assert.ok(recommend(["en"], zone).includes("isv"), zone);
  }
  for (const zone of ["Asia/Almaty", "Asia/Yerevan", "Europe/Chisinau"]) {
    assert.ok(!recommend(["en"], zone).includes("isv"), zone);
  }
});

test("legacy city aliases keep their own country", () => {
  assert.deepEqual(timeZoneData.zones.Iceland, ["is"]);
  assert.deepEqual(timeZoneData.zones["Africa/Timbuktu"], ["ml"]);
  assert.deepEqual(timeZoneData.zones["Pacific/Yap"], ["fm"]);
  assert.deepEqual(recommend(["en"], "Iceland"), []);
});

test("a geographic zone with no supported country language yields no suggestions", () => {
  assert.deepEqual(timeZoneData.zones["Asia/Yangon"], ["mm"]);
  assert.deepEqual(recommend(["en"], "Asia/Yangon"), []);
});

test("extraterritorial zones use direct language fallbacks", () => {
  assert.deepEqual(recommend(["en"], "Etc/GMT-8"), ["tl", "id"]);
  assert.deepEqual(recommend(["en"], "UTC"), ["fr", "pt", "es"]);
});

test("generic timezone names use direct language fallbacks", () => {
  assert.equal(timeZoneData.zones.CET, undefined);
  assert.deepEqual(recommend(["en"], "CET"), ["de", "fr", "it", "es"]);
  assert.deepEqual(recommend(["en"], "EST"), ["es", "fr"]);
});

test("unsupported fallback codes are removed before the four-language cap", () => {
  const custom = { "Etc/UTC": ["zh", "ko", "ar", "fr", "pt", "es", "ru"] };
  assert.deepEqual(recommend(["en"], "Etc/UTC", custom), ["ar", "fr", "pt", "es"]);
});

test("Tier 1 consumes slots before geographic recommendations", () => {
  assert.deepEqual(recommend(["ja-JP", "pt-BR"], "Europe/Zurich"), [
    "ja", "pt", "de", "fr",
  ]);
});

test("constructed languages move after other candidates before the four-language cap", () => {
  assert.deepEqual(recommend(["isv", "eo", "ja", "pt"], "Europe/Zurich"), [
    "ja", "pt", "de", "fr",
  ]);
  assert.deepEqual(recommend(["eo", "isv", "fr"], "Asia/Yangon"), [
    "fr", "eo", "isv",
  ]);
});
