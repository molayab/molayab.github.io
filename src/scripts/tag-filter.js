// Blog listing: filter post cards by tag (buttons, aria-pressed, #tag=<name>).
export function initTagFilter() {
  const bar = document.querySelector('.tag-filter-bar');
  if (!bar) return;
  const buttons = Array.from(bar.querySelectorAll('.tag-filter'));
  const cards = Array.from(document.querySelectorAll('.post-card'));
  const empty = document.querySelector('.post-empty-filtered');

  function applyTag(tag) {
    buttons.forEach((b) => {
      const active = b.getAttribute('data-tag') === tag;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    let visible = 0;
    cards.forEach((card) => {
      const tags = (card.getAttribute('data-tags') || '').split(' ');
      const show = !tag || tags.indexOf(tag) !== -1;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    if (empty) empty.style.display = visible === 0 ? '' : 'none';
  }

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-filter');
    if (!btn) return;
    const tag = btn.getAttribute('data-tag');
    applyTag(tag);
    history.replaceState(null, '', tag ? '#tag=' + encodeURIComponent(tag) : location.pathname);
  });

  const match = location.hash.match(/^#tag=(.+)$/);
  if (match) {
    const initial = decodeURIComponent(match[1]);
    if (buttons.some((b) => b.getAttribute('data-tag') === initial)) applyTag(initial);
  }
}
