import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Vinh Nguyen'),
    tags: z.array(z.string()),
    titleVi: z.string().optional(),
    descriptionVi: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
