// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { SITE_URL } from "./src/consts";

const deploy = import.meta.env.PROD
  ? { site: `https://${SITE_URL}/` }
  : { site: "http://localhost/" };

// https://astro.build/config
export default defineConfig({
  ...deploy,
  integrations: [mdx(), sitemap(), react()],
  redirects: {
    "/en/": {
      status: 301,
      destination: "/",
    },
  },
});
