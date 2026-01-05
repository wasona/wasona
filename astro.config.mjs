// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { config } from "selo-components/config";
import svelte from "@astrojs/svelte";

import { i18nQuotes } from "./plugins/quotes.mjs";

const deploy = import.meta.env.PROD
  ? { site: `https://${config.hostname}/` }
  : { site: "http://localhost/" };

// https://astro.build/config
export default defineConfig({
  ...deploy,
  integrations: [mdx(), sitemap(), svelte()],
  markdown: {
    remarkPlugins: [i18nQuotes],
  },
  redirects: {
    "/en/": {
      status: 301,
      destination: "/",
    },
  },
});
