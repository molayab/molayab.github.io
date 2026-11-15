// Post share row: copy link, native share sheet (when available).
export function initShare() {
  const copyBtn = document.getElementById('shareCopyBtn');
  const nativeBtn = document.getElementById('shareNativeBtn');
  const status = document.getElementById('shareStatus');
  if (!copyBtn && !nativeBtn) return;

  const announce = (msg) => { if (status) status.textContent = msg; };

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(input);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = copyBtn.getAttribute('data-url');
      const showCopied = () => {
        copyBtn.classList.add('is-copied');
        announce('Link copied');
        setTimeout(() => copyBtn.classList.remove('is-copied'), 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopied, () => { fallbackCopy(url); showCopied(); });
      } else {
        fallbackCopy(url);
        showCopied();
      }
    });
  }

  if (nativeBtn && navigator.share) {
    nativeBtn.style.display = '';
    nativeBtn.addEventListener('click', () => {
      navigator.share({
        title: nativeBtn.getAttribute('data-title'),
        text: nativeBtn.getAttribute('data-text'),
        url: nativeBtn.getAttribute('data-url'),
      }).catch(() => {});
    });
  }
}
