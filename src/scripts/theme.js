// Theme toggle. The pre-paint script in Base.astro has already set
// data-theme; this wires the button, persists the choice and keeps the
// browser chrome color (#themeColorMeta) in sync.
const STORAGE_KEY = 'molayab-theme';
const THEME_COLOR = { light: '#F6F5F0', dark: '#000000' };

export function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const sun = document.getElementById('iconSun');
  const moon = document.getElementById('iconMoon');
  const meta = document.getElementById('themeColorMeta');
  if (!btn || !sun || !moon) return;

  let dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved) dark = saved === 'dark';
  apply(dark);

  btn.addEventListener('click', () => {
    dark = !dark;
    apply(dark);
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
  });

  function apply(d) {
    root.setAttribute('data-theme', d ? 'dark' : 'light');
    sun.style.display = d ? 'block' : 'none';
    moon.style.display = d ? 'none' : 'block';
    btn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    if (meta) meta.setAttribute('content', d ? THEME_COLOR.dark : THEME_COLOR.light);
  }
}
