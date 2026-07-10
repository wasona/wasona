import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Intentionally duplicates the `task`/`exercise` schema from @/lib/exercise.ts.
// That file builds its schema with `z` from the standalone "zod" package, but a
// content-collection schema must be built with the *same* zod instance Astro
// ships via "astro:content" — passing the foreign instance's schema here fails.
// A shared makeSchemas(z) factory would dedupe the fields, but its `z` param
// would have to be untyped, collapsing `z.infer<Task>` to `any` and losing type
// safety everywhere Task is used. Keeping the small duplication is the better trade.
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
