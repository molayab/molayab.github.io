// Compatibility for posts written for Jekyll/Liquid. Post files are not
// rewritten (Grove's release flow keeps writing them in that style), so this
// plugin handles the two Liquid tags in use:
//
//   {% raw %} ... {% endraw %}     markers are dropped, content kept verbatim
//   {% post_url YYYY-MM-DD-slug %}  becomes /blog/YYYY/MM/DD/slug/
//
// It must run on the source text, before Markdown parsing: a link such as
// [x]({% post_url ... %}) contains spaces in its destination, so the parser
// would not treat it as a link. The plugin wraps the processor's parser.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = join(process.cwd(), '_posts');
const RAW_BLOCK = /\{%-?\s*raw\s*-?%\}([\s\S]*?)\{%-?\s*endraw\s*-?%\}/g;
const POST_URL = /\{%-?\s*post_url\s+([^\s%]+)\s*-?%\}/g;

let knownPosts;
function posts() {
  if (!knownPosts) {
    knownPosts = new Set(
      readdirSync(POSTS_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, '')),
    );
  }
  return knownPosts;
}

function resolvePostUrl(name, sourceFile) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!m || !posts().has(name)) {
    throw new Error(
      `{% post_url ${name} %} in ${sourceFile ?? 'a post'} does not match any file in _posts/`,
    );
  }
  return `/blog/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`;
}

export function convertLiquid(source, sourceFile) {
  let out = '';
  let last = 0;
  const convertPlain = (text) =>
    text.replace(POST_URL, (_, name) => resolvePostUrl(name, sourceFile));
  for (const m of source.matchAll(RAW_BLOCK)) {
    out += convertPlain(source.slice(last, m.index)) + m[1];
    last = m.index + m[0].length;
  }
  return out + convertPlain(source.slice(last));
}

export default function remarkLiquidCompat() {
  const parse = this.parser;
  this.parser = (doc, file) => {
    const converted = convertLiquid(String(doc), file?.path);
    // Source offsets in the parsed tree refer to this text (used by the typography plugin).
    if (file) file.data.convertedSource = converted;
    return parse(converted, file);
  };
}
