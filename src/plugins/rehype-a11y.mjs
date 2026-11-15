// Accessibility fixes for GFM output in post content (rehype step):
// - task-list checkboxes get an aria-label equal to their <li> text;
// - first-column <td> cells become <th scope="row"> so table rows have
//   headers (post.css keeps them looking like the old td).
const text = (node) => {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element' || node.tagName === 'ul' || node.tagName === 'ol') return '';
  return (node.children ?? []).map(text).join('');
};

export default function rehypeA11y() {
  return (tree) => {
    const walk = (node) => {
      if (node.type !== 'element' && node.type !== 'root') return;
      if (node.tagName === 'li') {
        for (const child of node.children) {
          if (child.type === 'element' && child.tagName === 'input' && child.properties?.type === 'checkbox') {
            const label = text(node).replace(/\s+/g, ' ').trim();
            if (label) child.properties.ariaLabel = label;
          }
        }
      }
      if (node.tagName === 'tr') {
        const first = node.children.find((c) => c.type === 'element');
        if (first && first.tagName === 'td') {
          first.tagName = 'th';
          first.properties = { ...first.properties, scope: 'row' };
        }
      }
      (node.children ?? []).forEach(walk);
    };
    walk(tree);
  };
}
