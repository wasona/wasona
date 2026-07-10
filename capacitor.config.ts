import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wasona.app",
  appName: "Wasona",
  // Astro's static output. `npm run build` regenerates it; `cap sync` copies it
  // into the native project. Kept in sync via the `cap:*` npm scripts.
  webDir: "dist",
};

export default config;
