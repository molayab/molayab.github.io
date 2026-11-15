import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Jekyll writes `date: 2026-08-01 12:00:00 -0000`, which YAML leaves as a
// string. Parse it (and real YAML timestamps) into a Date.
const jekyllDate = z.preprocess((value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const m = value
      .trim()
      .match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}(?::\d{2})?))?\s*(Z|[+-]\d{2}:?\d{2})?$/);
    if (m) {
      const tz = !m[3] || m[3] === 'Z' ? 'Z' : m[3].replace(/^([+-]\d{2}):?(\d{2})$/, '$1:$2');
      return new Date(`${m[1]}T${m[2] ?? '00:00'}${m[2]?.length === 5 ? ':00' : ''}${tz}`);
    }
  }
  return value;
}, z.date());

// Posts are read in place from _posts/ (Grove's release flow writes there).
// IDs are the filename without extension: YYYY-MM-DD-slug.
const posts = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './_posts',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    layout: z.string().optional(), // accepted and ignored (Jekyll leftover)
    title: z.string(),
    description: z.string().optional(),
    date: jekyllDate,
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    image_alt: z.string().optional(),
    last_modified_at: jekyllDate.optional(),
  }),
});

export const collections = { posts };
