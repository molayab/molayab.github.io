// Mermaid diagrams. Fenced ```mermaid blocks are emitted as
// <pre><code class="language-mermaid"> (no-JS fallback is styled raw source).
// mermaid.js is loaded from the CDN only on pages that contain such a block,
// and diagrams re-render with the matching theme when the toggle is used.
const MERMAID_SRC = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';

function mermaidTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';
}

function loadMermaid() {
  return new Promise((resolve, reject) => {
    if (window.mermaid) return resolve(window.mermaid);
    const script = document.createElement('script');
    script.src = MERMAID_SRC;
    script.onload = () => resolve(window.mermaid);
    script.onerror = reject;
    document.head.appendChild(script);
  });
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

  loadMermaid().then((mermaid) => {
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
