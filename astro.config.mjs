// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { config } from "selo-components/config";
import svelte from "@astrojs/svelte";
import { readdirSync } from "node:fs";

const deploy = import.meta.env.PROD
  ? { site: `https://${config.hostname}/` }
  : { site: "http://localhost/" };

// https://astro.build/config
export default defineConfig({
  ...deploy,
  integrations: [mdx(), sitemap(), svelte()],
  i18n: {
    locales: readdirSync(new URL("./content/", import.meta.url), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "translate")
      .map((entry) => entry.name)
      .sort(),
    defaultLocale: 'en',
  },
  redirects: {
    "/en/": {
      status: 301,
      destination: "/",
    },
  },
});
