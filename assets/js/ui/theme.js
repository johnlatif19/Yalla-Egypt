const STORAGE_KEY = 'yalla-theme';
const THEMES = ['light', 'dark'];

function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export function applyTheme(theme) {
  const safeTheme = THEMES.includes(theme) ? theme : 'light';
  document.documentElement.setAttribute('data-theme', safeTheme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', safeTheme === 'dark' ? '#0A1A26' : '#FFF9EF');
  }
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: safeTheme } }));
}

export function setTheme(theme) {
  const safeTheme = THEMES.includes(theme) ? theme : 'light';
  applyTheme(safeTheme);
  try {
    localStorage.setItem(STORAGE_KEY, safeTheme);
  } catch {
    // ignore storage errors
  }
}

export function toggleTheme() {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

function themeIcon(theme) {
  if (theme === 'dark') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
}

function updateToggleButton(btn) {
  const theme = getCurrentTheme();
  btn.innerHTML = themeIcon(theme);
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

export function initTheme() {
  const stored = getStoredTheme();
  applyTheme(stored || getSystemTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
      document.querySelectorAll('[data-theme-toggle]').forEach(updateToggleButton);
    }
  });

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    if (btn.dataset.themeBound === 'true') return;
    btn.dataset.themeBound = 'true';
    updateToggleButton(btn);
    btn.addEventListener('click', () => {
      toggleTheme();
      document.querySelectorAll('[data-theme-toggle]').forEach(updateToggleButton);
    });
  });
}