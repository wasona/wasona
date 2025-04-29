import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `/content/` directory.
  loader: glob({ base: "./src/content/lessons/", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    richDescription: z.string().optional(),
    order: z.string(),
    practice: z
      .array(z.object({ l1: z.string(), l2: z.string() }))
      .nonempty()
      .optional(),
  }),
});

const meta = defineCollection({
  loader: glob({ base: "./src/content/meta/", pattern: "**/*.{md,mdx}" }),
  schema: z.object({}),
});

export const collections = { blog, meta };
