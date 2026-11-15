// Atom feed (not RSS: grove-website's blog.js parses the Atom namespace).
// Mirrors jekyll-feed: 10 newest entries, entry id = post URL without the
// trailing slash (so subscribers do not see duplicates), link rel="alternate",
// published/updated, one <category term> per tag, summary and content.
import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../data/site';
import { getPosts, postUrl, xmlSchema } from '../lib/posts';

const FEED_SIZE = 10;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
// Inline highlighter styles are CSS variables that mean nothing in a reader.
const cleanContent = (html: string) => html.replace(/ style="[^"]*"/g, '').replace(/ tabindex="0"/g, '');

export const GET: APIRoute = async () => {
  const posts = (await getPosts()).slice(0, FEED_SIZE);
  const feedUpdated = xmlSchema(
    new Date(Math.max(...posts.map((p) => (p.data.last_modified_at ?? p.data.date).valueOf()))),
  );

  const entries = posts.map((post) => {
    const url = absoluteUrl(postUrl(post));
    const image = post.data.image ? absoluteUrl(post.data.image) : undefined;
    return `<entry>
<title type="html">${esc(post.data.title)}</title>
<link href="${url}" rel="alternate" type="text/html" title="${esc(post.data.title)}" />
<published>${xmlSchema(post.data.date)}</published>
<updated>${xmlSchema(post.data.last_modified_at ?? post.data.date)}</updated>
<id>${url.replace(/\/$/, '')}</id>
<content type="html" xml:base="${url}">${cdata(cleanContent(post.rendered?.html ?? ''))}</content>
<author><name>${esc(SITE.author)}</name></author>
${post.data.tags.map((tag) => `<category term="${esc(tag)}" />`).join('\n')}
${post.data.description ? `<summary type="html">${cdata(post.data.description)}</summary>` : ''}
${image ? `<media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="${image}" />\n<media:content medium="image" url="${image}" xmlns:media="http://search.yahoo.com/mrss/" />` : ''}
</entry>`.replace(/\n{2,}/g, '\n');
  });

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<generator uri="https://astro.build/">Astro</generator>
<link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/atom+xml" />
<link href="${SITE.url}/" rel="alternate" type="text/html" />
<updated>${feedUpdated}</updated>
<id>${absoluteUrl('/feed.xml')}</id>
<title type="html">${esc(SITE.title)}</title>
<subtitle>${esc(SITE.description)}</subtitle>
<author><name>${esc(SITE.author)}</name></author>
${entries.join('\n')}
</feed>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
