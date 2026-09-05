import type { APIRoute } from "astro";
import { langs } from "@/lib/i18n";
import { getAbsoluteLocaleUrl } from "astro:i18n";

export const GET = (() => {
  return new Response(JSON.stringify(Object.fromEntries(
    langs.map((lang) => [lang, {url: getAbsoluteLocaleUrl(lang)}])
  )));
}) satisfies APIRoute;
