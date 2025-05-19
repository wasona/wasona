import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `/content/` directory.
  loader: glob({ base: "./content/", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
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
  }),
});

export const collections = { blog };
