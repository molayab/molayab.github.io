import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkLiquidCompat from './src/plugins/remark-liquid-compat.mjs';
import remarkNoAutolinkLiterals from './src/plugins/remark-no-autolink-literals.mjs';
import remarkKramdownTypography from './src/plugins/remark-kramdown-typography.mjs';
import rehypeA11y from './src/plugins/rehype-a11y.mjs';
import copyPostCovers from './src/integrations/copy-post-covers.mjs';
import { codeTheme, codeWrapper } from './src/plugins/code-theme.mjs';

// URLs must match the Jekyll site exactly: directory output with trailing
// slashes (/blog/2026/11/14/slug/), and 404.astro emits /404.html.
export default defineConfig({
  site: 'https://molayab.com',
  output: 'static',
  trailingSlash: 'always',
  // Keep whitespace between text and inline elements exactly as authored
  // (the default compressor can drop the space in "click\n<strong>").
  compressHTML: false,
  build: { format: 'directory' },
  integrations: [copyPostCovers()],
  // mermaid ships as large lazy chunks, loaded only on diagram posts.
  vite: { build: { chunkSizeWarningLimit: 1000 } },
  markdown: {
    // Astro 7's default Markdown processor is not unified-based; the compat
    // plugin is a remark plugin, so use the unified processor explicitly.
    processor: unified({
      remarkPlugins: [remarkLiquidCompat, remarkNoAutolinkLiterals, remarkKramdownTypography],
      smartypants: false, // replaced by the kramdown-compatible plugin
    }),
    rehypePlugins: [rehypeA11y],
    syntaxHighlight: {
      type: 'shiki',
      // Mermaid blocks stay as plain code blocks; the client script renders them.
      excludeLangs: ['mermaid'],
    },
    shikiConfig: { theme: codeTheme, transformers: [codeWrapper] },
  },
});
