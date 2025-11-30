import { exercise } from "@/lib/exercise";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

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
