#!/usr/bin/env node
// Build hook: fetch the `kalama` audio repo and stage it under public/kalama so
// the app build can bundle it for offline playback (PUBLIC_KALAMA_BASE=/kalama,
// set by the cap:* scripts). The website build skips this and streams from the
// remote GitHub mirror instead (see src/lib/audio.ts).
//
// kalama is a separate repo to keep binary blobs out of this repo's history, so
// we fetch it at build time (chosen over a git submodule) and never commit the
// result — public/kalama and the clone cache are gitignored.
//
// Usage: node scripts/fetch-kalama.mjs [--force]
//   --force  re-pull the cache and re-stage public/kalama even if present.

import { execFileSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const REPO = "https://github.com/wasona/kalama";
const BRANCH = "main";
// Media directories to bundle; skip README / changelog / wishlist text files.
const MEDIA_DIRS = ["wikimedia", "kala-asi", "jan-lakuse", "sfx"];

const root = fileURLToPath(new URL("..", import.meta.url));
const cacheDir = join(root, ".cache", "kalama");
const publicDir = join(root, "public", "kalama");
const force = process.argv.includes("--force");

const git = (args) =>
  execFileSync("git", args, { stdio: "inherit" });

if (existsSync(publicDir) && !force) {
  console.log(
    "[kalama] public/kalama already present — skipping (use --force to refresh).",
  );
  process.exit(0);
}

// 1) Ensure a shallow clone in the cache (pull only when refreshing).
if (!existsSync(join(cacheDir, ".git"))) {
  console.log(`[kalama] cloning ${REPO} (shallow)…`);
  rmSync(cacheDir, { recursive: true, force: true });
  mkdirSync(cacheDir, { recursive: true });
  git(["clone", "--depth", "1", "--branch", BRANCH, REPO, cacheDir]);
} else if (force) {
  console.log("[kalama] refreshing cache…");
  git(["-C", cacheDir, "fetch", "--depth", "1", "origin", BRANCH]);
  git(["-C", cacheDir, "reset", "--hard", `origin/${BRANCH}`]);
}

// 2) Stage the media dirs under public/kalama (fresh copy each run).
rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });
for (const dir of MEDIA_DIRS) {
  const src = join(cacheDir, dir);
  if (!existsSync(src)) {
    console.warn(`[kalama] warning: '${dir}' not found in repo — skipping.`);
    continue;
  }
  cpSync(src, join(publicDir, dir), { recursive: true });
}
console.log(`[kalama] staged ${MEDIA_DIRS.join(", ")} → public/kalama/`);
