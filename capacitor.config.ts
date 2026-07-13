import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wasona.app",
  appName: "Wasona",
  // Astro's static output. `npm run build` regenerates it; `cap sync` copies it
  // into the native project. Kept in sync via the `cap:*` npm scripts.
  webDir: "dist",
  server: {
    // Serve the bundled site from the real production origin. The static build
    // (site: https://wasona.com) emits some internal links as absolute
    // https://wasona.com/... URLs — content cross-references, canonical tags.
    // Matching the WebView origin to that hostname keeps those links in-app
    // instead of treating them as off-origin and kicking out to the browser.
    // Assets are still served locally from `webDir`; only genuinely external
    // domains hit the network.
    androidScheme: "https",
    hostname: "wasona.com",
  },
};

export default config;
