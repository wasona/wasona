import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `/content/` directory.
  loader: glob({ base: "./content/", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const meta = defineCollection({
  loader: glob({ base: "./src/content/meta/", pattern: "**/*.{md,mdx}" }),
  schema: z.object({}),
});

export const collections = { blog, meta };
