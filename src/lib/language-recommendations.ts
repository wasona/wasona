export interface LanguageMetadata {
  endonym: string;
  english: string;
  suggest_in: string[];
}

export interface RecommendationSources {
  languages: Record<string, LanguageMetadata>;
  constructedLanguages: readonly string[];
  browserLanguages: readonly string[];
  timeZone: string;
  countriesByZone: Record<string, string[]>;
  fallbackLanguagesByZone: Record<string, string[]>;
  fallbackAliases: Record<string, string>;
}

const languageAliases: Record<string, string> = {
  in: "id",
  iw: "he",
};

export function recommendLanguages({
  languages,
  constructedLanguages,
  browserLanguages,
  timeZone,
  countriesByZone,
  fallbackLanguagesByZone,
  fallbackAliases,
}: RecommendationSources): string[] {
  const recommendations: string[] = [];

  function add(code: string) {
    if (
      code !== "en" &&
      Object.hasOwn(languages, code) &&
      !recommendations.includes(code)
    ) {
      recommendations.push(code);
    }
  }

  // A locale's country suffix is irrelevant to Tier 1.
  for (const locale of browserLanguages) {
    const language = locale.toLowerCase().split(/[-_]/, 1)[0];
    add(languageAliases[language] ?? language);
  }

  const countries = countriesByZone[timeZone];
  if (countries) {
    // zone.tab identifies the country of each named geographic zone.
    for (const country of countries) {
      for (const [code, metadata] of Object.entries(languages)) {
        if (metadata.suggest_in.includes(country)) add(code);
      }
    }
  } else {
    // Nongeographic zones go straight to language codes. Unsupported codes
    // are filtered by add() before the four-slot cap is applied.
    const fallbackZone = fallbackAliases[timeZone] ?? timeZone;
    for (const code of fallbackLanguagesByZone[fallbackZone] ?? []) add(code);
  }

  const constructedLanguageSet = new Set(constructedLanguages);
  return [
    ...recommendations.filter((code) => !constructedLanguageSet.has(code)),
    ...recommendations.filter((code) => constructedLanguageSet.has(code)),
  ].slice(0, 4);
}
