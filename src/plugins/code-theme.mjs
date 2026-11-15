// Shiki theme that reproduces the Rouge palette the site used under Jekyll.
// Colors are CSS variables (--code-*, defined in src/styles/post.css on top of
// the theme tokens), so one theme follows both data-theme and the OS setting.
const keyword = 'var(--code-keyword)';
const string = 'var(--code-string)';
const fn = 'var(--code-fn)';
const comment = 'var(--code-comment)';
const text = 'var(--text)';
const muted = 'var(--text-2)';

export const codeTheme = {
  name: 'molayab-rouge',
  type: 'dark',
  fg: text,
  bg: 'var(--surface-2)',
  colors: {
    'editor.foreground': text,
    'editor.background': 'var(--surface-2)',
  },
  settings: [
    { settings: { foreground: text, background: 'var(--surface-2)' } },
    // Rouge .c .c1 .cm .cp
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: comment, fontStyle: 'italic' } },
    // Rouge .k .kc .kd .kn .kp .kr .kt .ow
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.operator.word',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.operator.logical.python',
        'variable.language',
        'constant.language',
        'support.type.primitive',
        'entity.name.type.primitive',
        'support.type.swift',
        'meta.import entity.name.type',
      ],
      settings: { foreground: keyword },
    },
    // Rouge .s* and .m* (strings and numbers share a color)
    {
      scope: [
        'string',
        'punctuation.definition.string',
        'constant.numeric',
        'constant.character',
        'constant.other.symbol',
      ],
      settings: { foreground: string },
    },
    // Rouge .nf .nc .nn .nb
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call entity.name.function',
        'entity.name.type',
        'entity.name.class',
        'entity.name.namespace',
        'entity.name.section',
        'support.class',
        'support.constant',
      ],
      settings: { foreground: fn },
    },
    // Rouge .n .na .nv .nt
    {
      scope: [
        'variable',
        'variable.other',
        'variable.parameter',
        'entity.name.tag',
        'entity.other.attribute-name',
        'support.type.property-name',
        'meta.object-literal.key',
        // Rouge leaves shell command names and arguments, YAML plain scalars,
        // XML tag brackets and redirects in the default text color.
        'entity.name.command',
        'entity.name.function.call.shell',
        'string.unquoted.argument',
        'constant.other.option',
        'punctuation.definition.tag',
        'keyword.operator.redirect',
        'punctuation.separator.key-value.mapping.yaml',
        'punctuation.definition.block.sequence.item.yaml',
        'punctuation.definition.sequence',
        'punctuation.separator.sequence.yaml',
      ],
      settings: { foreground: text },
    },
    // Rouge .o .p
    {
      scope: ['keyword.operator', 'punctuation', 'meta.brace', 'keyword.control.flow.block-scalar'],
      settings: { foreground: muted },
    },
  ],
};

// Wrap each highlighted block as div.highlighter-rouge > div.highlight >
// pre.highlight (the structure the site's code-block CSS was written for).
export const codeWrapper = {
  name: 'molayab-rouge-wrapper',
  // Rouge colors Swift's plain punctuation (. , : ;) like operators; TextMate
  // leaves those characters unscoped, so set them here.
  span(node, _line, _col, _lineEl, token) {
    if (this.options.lang === 'swift' && /^[.,:;]+$/.test(token.content.trim())) {
      node.properties.style = 'color:var(--text-2)';
    }
  },
  pre(node) {
    const cls = node.properties.class ? String(node.properties.class).split(' ') : [];
    node.properties.class = [...cls, 'highlight'].join(' ');
  },
  root(root) {
    const pre = root.children.find((c) => c.type === 'element' && c.tagName === 'pre');
    if (!pre) return;
    const wrap = (cls, child) => ({ type: 'element', tagName: 'div', properties: { class: cls }, children: [child] });
    root.children = [wrap('highlighter-rouge', wrap('highlight', pre))];
  },
};
