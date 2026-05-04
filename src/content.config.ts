import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Duplicating @/lib/exercise.ts
// Current version of zod for some reason really hates
// trying to import {task, exercise} despite them being
// defined identically.
const task = z
  .object({
    l1: z.string(),
    l2: z.string(),
    alsoAccept: z.string().array().optional(),
    junkChips: z.string().array().optional(),
  })
  .strict();
export type Task = z.infer<typeof task>;

const exercise = z
  .object({
    title: z.string(),
    tasks: z.array(task),
  })
  .strict();
export type Exercise = z.infer<typeof exercise>;

const contentSchema = z.object({
  title: z.string(),
  description: z.string(),
  practice: z.array(exercise).nonempty().optional(),
});

export const collections = {
  content: defineCollection({
    loader: glob({ base: "./content/", pattern: "**/*.{md,mdx}" }),
    schema: contentSchema,
  }),
};
