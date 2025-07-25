// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

const deploy = import.meta.env.PROD
  ? { site: "https://wasona.com/" }
  : { site: "http://localhost/" };

const redirects = {
  "/en/": {
    status: 301,
    destination: "/",
  }
}

// https://astro.build/config
export default defineConfig({
  ...deploy,
  integrations: [mdx(), sitemap(), react()],
  redirects
});
