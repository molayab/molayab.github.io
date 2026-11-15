// kramdown (GFM input) only links what the author wrote as a link: bare
// emails and URLs stay plain text. remark-gfm's autolink literals would turn
// them into links, which changes existing posts, so unwrap those nodes.
// Explicit [text](url) and <url> links are kept.
export default function remarkNoAutolinkLiterals() {
  return (tree, file) => {
    const source = file.data.convertedSource ?? String(file);
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'link' && child.position) {
          const first = source[child.position.start.offset];
          if (first !== '[' && first !== '<') {
            return { type: 'text', value: source.slice(child.position.start.offset, child.position.end.offset) };
          }
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}
