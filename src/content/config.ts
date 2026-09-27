import { z, defineCollection } from 'astro:content';

const carsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    thumbnail: z.string(),
    features: z.array(z.string()),
    whatsappMessage: z.string(),
  }),
});

const toursCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    thumbnail: z.string(),
    tagline: z.string(),
    whatsappMessage: z.string(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishDate: z.date(),
    thumbnail: z.string(),
    excerpt: z.string(),
  }),
});

export const collections = {
  cars: carsCollection,
  tours: toursCollection,
  blog: blogCollection,
};
