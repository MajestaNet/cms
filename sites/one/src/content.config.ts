import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        cmsPage: z.string().optional(),
        cmsFigures: z
          .array(
            z.object({
              src: z.string(),
              alt: z.string(),
              caption: z.string(),
            }),
          )
          .optional(),
      }),
    }),
  }),
};
