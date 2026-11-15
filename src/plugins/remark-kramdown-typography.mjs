// Typography as kramdown (Jekyll) rendered it, so existing posts keep their
// exact text: --- / -- / ... and the smart-quote rules, ported from
// kramdown's parser (smart_quotes.rb, typographic_symbol.rb). The stock
// remark smartypants differs in a few cases (for example a quote followed by
// punctuation, as in "+"), so it is turned off in astro.config.mjs.
//
// Like kramdown, quotes are resolved per run of plain text; inline code,
// emphasis boundaries and links start a new run, which is what makes the
// quote after `code` an opening one there. The one known difference: kramdown
// also starts a new run at an HTML entity (&lt;), mdast has already decoded
// those, so a quote right after one gets the typographically correct glyph.

const LDQUO = '“';
const RDQUO = '”';
const LSQUO = '‘';
const RSQUO = '’';

const PUNCT = `[!"#$%'()*+,\\-./:;<=>?@\\[\\\\\\]^_\`{|}~]`;
const CLOSE = `[^ \\\\\\t\\r\\n\\[{(-]`;

// [regex, outputs]: number = literal capture group, string = glyph or
// 'q<n>:l|r' meaning "quote char of group n becomes the left/right glyph".
const RULES = [
  [new RegExp(`(["'])(?=[_*]{1,2}\\S)`, 'y'), [['L', 1]]],
  [new RegExp(`(["'])(?=${PUNCT}(?!\\.\\.)\\B)`, 'y'), [['R', 1]]],
  [new RegExp(`(\\s?)"'(?=\\w)`, 'y'), [1, LDQUO, LSQUO]],
  [new RegExp(`(\\s?)'"(?=\\w)`, 'y'), [1, LSQUO, LDQUO]],
  [new RegExp(`(\\s?)'(?=\\d\\ds)`, 'y'), [1, RSQUO]],
  [new RegExp(`(\\s)(["'])(?=\\w)`, 'y'), [1, ['L', 2]]],
  [new RegExp(`(${CLOSE})(["'])`, 'y'), [1, ['R', 2]]],
  [new RegExp(`(["'])(?=\\s|s\\b|$)`, 'my'), [['R', 1]]],
  [new RegExp(`(.?)'`, 'sy'), [1, LSQUO]],
  [new RegExp(`(.?)"`, 'sy'), [1, LDQUO]],
];

const glyph = (side, quote) =>
  side === 'L' ? (quote === '"' ? LDQUO : LSQUO) : quote === '"' ? RDQUO : RSQUO;

function smartQuotes(text) {
  const next = /[^\\]?["']/g;
  let out = '';
  let pos = 0;
  while (pos < text.length) {
    next.lastIndex = pos;
    const found = next.exec(text);
    if (!found) break;
    out += text.slice(pos, found.index);
    pos = found.index;
    for (const [re, parts] of RULES) {
      re.lastIndex = pos;
      const m = re.exec(text);
      if (!m) continue;
      for (const part of parts) {
        if (typeof part === 'number') out += m[part];
        else if (typeof part === 'string') out += part;
        else out += glyph(part[0], m[part[1]]);
      }
      pos = re.lastIndex;
      break;
    }
  }
  return out + text.slice(pos);
}

function typographicSymbols(text) {
  return text.replace(/---|--|\.\.\./g, (s) => (s === '---' ? '—' : s === '--' ? '–' : '…'));
}

const NAMED = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: '\u00A0' };
const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi;

function decodeEntity(name) {
  if (name[0] === '#') {
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return String.fromCodePoint(code);
  }
  return NAMED[name];
}

// kramdown parses an HTML entity as its own element, which ends the run of
// text a quote can look back into. mdast has already decoded entities, so when
// the source slice of a text node contains some, split the run there again.
function transformText(node, source) {
  const raw = source && node.position ? source.slice(node.position.start.offset, node.position.end.offset) : '';
  if (raw && ENTITY.test(raw)) {
    ENTITY.lastIndex = 0;
    const pieces = [];
    let decoded = '';
    let last = 0;
    let ok = true;
    for (const m of raw.matchAll(ENTITY)) {
      const ch = decodeEntity(m[1]);
      if (ch === undefined) { ok = false; break; }
      pieces.push({ text: raw.slice(last, m.index) }, { entity: ch });
      decoded += raw.slice(last, m.index) + ch;
      last = m.index + m[0].length;
    }
    pieces.push({ text: raw.slice(last) });
    decoded += raw.slice(last);
    if (ok && decoded === node.value) {
      node.value = pieces
        .map((p) => (p.entity !== undefined ? p.entity : smartQuotes(typographicSymbols(p.text))))
        .join('');
      return;
    }
  }
  ENTITY.lastIndex = 0;
  node.value = smartQuotes(typographicSymbols(node.value));
}

function walk(node, source) {
  if (node.type === 'text') {
    transformText(node, source);
  } else if (node.children && node.type !== 'code' && node.type !== 'inlineCode') {
    node.children.forEach((child) => walk(child, source));
  }
}

export default function remarkKramdownTypography() {
  return (tree, file) => walk(tree, file.data.convertedSource);
}
