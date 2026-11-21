import { readFileSync, writeFileSync } from "node:fs";

// Run with optional paths to IANA's zone.tab and tzdata.zi. The checked-in
// output lets the site work offline, including in the Android app.
const zoneTablePath = process.argv[2] ?? "/usr/share/zoneinfo/zone.tab";
const tzdataPath = process.argv[3] ?? "/usr/share/zoneinfo/tzdata.zi";
const outputPath = new URL("../src/data/timezone-countries.json", import.meta.url);

const zoneTable = readFileSync(zoneTablePath, "utf8");
const tzdata = readFileSync(tzdataPath, "utf8");
const languageFallbacks = JSON.parse(readFileSync(
  new URL("../src/data/timezone-language-fallbacks.json", import.meta.url), "utf8",
));
const version = tzdata.match(/^# version (\S+)/m)?.[1];
if (!version) throw new Error("Could not find the tzdb version in tzdata.zi");

const countriesByZone = new Map();
for (const line of zoneTable.split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const [country, , zone] = line.split("\t");
  if (!country || !zone || country.includes(",")) {
    throw new Error(`Invalid zone.tab row: ${line}`);
  }
  countriesByZone.set(zone, [country.toLowerCase()]);
}

// These legacy links have a more specific location than their clock-equivalent
// target. They are absent from zone.tab, so inheriting the target is misleading.
const legacyAliasCountries = new Map(Object.entries({
  "Africa/Asmera": "er",
  "Africa/Timbuktu": "ml",
  "America/Coral_Harbour": "ca",
  "America/Virgin": "vi",
  "Antarctica/South_Pole": "aq",
  "Atlantic/Jan_Mayen": "sj",
  "Iceland": "is",
  "Pacific/Ponape": "fm",
  "Pacific/Truk": "fm",
  "Pacific/Yap": "fm",
}));

const links = new Map();
for (const line of tzdata.split("\n")) {
  if (!line.startsWith("L ")) continue;
  const [, target, alias] = line.split(/\s+/);
  links.set(alias, target);
}

function countriesFor(zone, seen = new Set()) {
  if (countriesByZone.has(zone)) return countriesByZone.get(zone);
  if (seen.has(zone)) throw new Error(`Circular tzdb alias: ${zone}`);
  seen.add(zone);
  const target = links.get(zone);
  return target ? countriesFor(target, seen) : undefined;
}

function canonicalZone(zone, seen = new Set()) {
  if (seen.has(zone)) throw new Error(`Circular tzdb alias: ${zone}`);
  const target = links.get(zone);
  if (!target) return zone;
  seen.add(zone);
  return canonicalZone(target, seen);
}

const fallbackAliases = new Map();
for (const alias of links.keys()) {
  // Generic names such as CET do not identify a country. Their curated
  // language lists live alongside the Etc/ fallbacks instead.
  if (Object.hasOwn(languageFallbacks, alias)) continue;
  const canonical = canonicalZone(alias);
  if (canonical.startsWith("Etc/") || canonical === "Factory") {
    fallbackAliases.set(alias, canonical);
    continue;
  }
  const countries = legacyAliasCountries.has(alias)
    ? [legacyAliasCountries.get(alias)]
    : countriesFor(alias);
  if (!countries) throw new Error(`No country for tzdb alias: ${alias}`);
  countriesByZone.set(alias, countries);
}

const zoneRows = [...countriesByZone]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([zone, countries]) => `    ${JSON.stringify(zone)}: ${JSON.stringify(countries)}`);
const aliasRows = [...fallbackAliases]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([alias, target]) => `    ${JSON.stringify(alias)}: ${JSON.stringify(target)}`);
writeFileSync(outputPath, `{
  "version": ${JSON.stringify(version)},
  "zones": {
${zoneRows.join(",\n")}
  },
  "fallbackAliases": {
${aliasRows.join(",\n")}
  }
}
`);
console.log(`Wrote ${countriesByZone.size} geographic time zones from tzdb ${version}`);
