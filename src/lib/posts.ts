import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// No date filtering on purpose (the Jekyll site set `future: true`): a post
// dated slightly ahead of the build time must still publish, otherwise it
// silently vanishes from the listing, sitemap and feed until a later rebuild.
// Do not "fix" this by filtering on `date <= now`.
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** /blog/YYYY/MM/DD/slug/ from the filename (YYYY-MM-DD-slug), not the front matter. */
export function postParts(post: Post) {
  const m = post.id.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!m) throw new Error(`Post file name must be YYYY-MM-DD-slug.md: ${post.id}`);
  return { year: m[1], month: m[2], day: m[3], slug: m[4] };
}

export function postUrl(post: Post): string {
  const { year, month, day, slug } = postParts(post);
  return `/blog/${year}/${month}/${day}/${slug}/`;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
const html = (post: Post) => post.rendered?.html ?? '';

export function wordCount(post: Post): number {
  return stripHtml(html(post)).split(/\s+/).filter(Boolean).length;
}

/** Same formula as the Jekyll site: words / 200, rounded down, minimum 1. */
export function readingMinutes(post: Post): number {
  return Math.max(1, Math.floor(wordCount(post) / 200));
}

/** Liquid's truncate: cut to `max` characters in total, ending in "...". */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
}

/** Full description for meta tags and JSON-LD: the written one, else the start of the body. */
export function postDescription(post: Post, fallbackMax = 200): string {
  if (post.data.description) return post.data.description;
  return truncate(stripHtml(html(post)).replace(/\s+/g, ' ').trim(), fallbackMax);
}

/** Description shown on cards, shortened like the Jekyll listing did. */
export function cardDescription(post: Post, max: number): string {
  return truncate(postDescription(post, max).replace(/\s+/g, ' ').trim(), max);
}

/** Like Liquid's url_encode (CGI.escape): spaces become "+". */
export function urlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()~]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%20/g, '+');
}

const long = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const short = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => long.format(d); // November 14, 2026
export const formatDateShort = (d: Date) => short.format(d); // Nov 14, 2026

/** 2026-11-14T12:00:00+00:00, like Jekyll's date_to_xmlschema. */
export const xmlSchema = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '+00:00');

export function tagCounts(posts: Post[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}
