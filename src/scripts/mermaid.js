// Mermaid diagrams. Fenced ```mermaid blocks are emitted as
// <pre><code class="language-mermaid"> (no-JS fallback is styled raw source).
// mermaid is bundled from npm (exact version in package.json) and loaded with
// a dynamic import only on pages that contain such a block, so no third-party
// origin is involved. Diagrams re-render with the matching theme when the
// toggle is used.
function mermaidTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
}

export function initMermaid() {
  const blocks = document.querySelectorAll('pre > code.language-mermaid');
  if (!blocks.length) return;

  blocks.forEach((code) => {
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.setAttribute('data-mermaid-source', code.textContent);
    div.textContent = code.textContent;
    code.parentElement.replaceWith(div);
  });

  import('mermaid').then(({ default: mermaid }) => {
    function render() {
      const diagrams = document.querySelectorAll('.mermaid[data-mermaid-source]');
      if (!diagrams.length) return;
      mermaid.initialize({ startOnLoad: false, theme: mermaidTheme() });
      diagrams.forEach((el) => {
        el.removeAttribute('data-processed');
        el.textContent = el.getAttribute('data-mermaid-source');
      });
      mermaid.run({ nodes: diagrams });
    }
    render();
    document.addEventListener('themechange', render);
  }, () => {});
}
