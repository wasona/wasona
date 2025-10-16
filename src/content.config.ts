import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const contentSchema = z.object({
  title: z.string(),
  description: z.string(),
  practice: z
    .array(
      z.object({
        l1: z.string(),
        l2: z.string(),
        alsoAccept: z.string().array().nonempty().optional(),
      }),
    )
    .nonempty()
    .optional(),
});

export const collections = {
  content: defineCollection({
    loader: glob({ base: "./content/", pattern: "**/*.{md,mdx}" }),
    schema: contentSchema,
  }),
};
