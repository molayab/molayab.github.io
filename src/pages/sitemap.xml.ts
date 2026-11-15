// Flat /sitemap.xml (what robots.txt and the Pipeline profile point at).
// @astrojs/sitemap only emits sitemap-index.xml + sitemap-N.xml, so this is a
// small endpoint instead. Same content as jekyll-sitemap: every post (with
// lastmod), /blog/ and /. The 404 page is not listed.
import type { APIRoute } from 'astro';
import { absoluteUrl } from '../data/site';
import { getPosts, postUrl, xmlSchema } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = (await getPosts()).reverse();
  const urls = [
    ...posts.map(
      (p) => `<url>\n<loc>${absoluteUrl(postUrl(p))}</loc>\n<lastmod>${xmlSchema(p.data.last_modified_at ?? p.data.date)}</lastmod>\n</url>`,
    ),
    `<url>\n<loc>${absoluteUrl('/blog/')}</loc>\n</url>`,
    `<url>\n<loc>${absoluteUrl('/')}</loc>\n</url>`,
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
