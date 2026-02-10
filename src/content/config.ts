import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content', // For MDX files
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Vinh Nguyen'),
    tags: z.array(z.string()),
    // Support bilingual content
    titleVi: z.string().optional(),
    descriptionVi: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};
