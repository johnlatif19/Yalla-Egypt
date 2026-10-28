import { t } from '/assets/js/i18n/index.js';
import { getCurrentPath } from '/assets/js/core/router.js';

function navLink(href, labelKey, activePath) {
  const active = activePath === href || (href !== '/' && activePath.startsWith(href));
  return `
    <li>
      <a href="${href}" class="nav-link" ${active ? 'aria-current="page"' : ''} data-i18n="${labelKey}">${t(labelKey)}</a>
    </li>
  `;
}

function buildHeader() {
  const activePath = getCurrentPath();

  const header = document.createElement('header');
  header.className = 'site-header';

  header.innerHTML = `
    <div class="container site-header__inner">
      <a href="/" class="brand" aria-label="Yalla Egypt">
        <img src="/assets/images/logo.webp" alt="Yalla Egypt" width="auto" height="48">
      </a>

      <nav class="desktop-nav" aria-label="Main navigation">
        <ul class="nav-list">
          ${navLink('/', 'nav.home', activePath)}
          ${navLink('/tours', 'nav.tours', activePath)}
          ${navLink('/about', 'nav.about', activePath)}
          ${navLink('/contact', 'nav.contact', activePath)}
        </ul>
      </nav>

      <div class="header-actions">
        <button type="button" class="icon-btn" data-theme-toggle aria-label="${t('a11y.toggleTheme')}"></button>
        <button type="button" class="icon-btn" data-lang-toggle aria-label="${t('a11y.switchLanguage')}">
          <span data-lang-label style="font-size: var(--fs-xs); font-weight: var(--fw-semibold);">${t('lang.switchTo')}</span>
        </button>
        <a href="/booking" class="btn btn--accent btn--sm hide-mobile" data-i18n="nav.book">${t('nav.book')}</a>
        <button type="button" class="icon-btn mobile-nav-toggle" data-mobile-nav-open aria-label="${t('a11y.openMenu')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </div>
    </div>
  `;

  return header;
}

function buildMobileNav(activePath) {
  const nav = document.createElement('div');
  nav.className = 'mobile-nav';
  nav.id = 'mobile-nav';
  nav.setAttribute('aria-hidden', 'true');

  nav.innerHTML = `
    <button type="button" class="icon-btn mobile-nav__close" data-mobile-nav-close aria-label="${t('a11y.closeMenu')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>

    <ul class="mobile-nav__list">
      <li><a href="/" ${activePath === '/' ? 'aria-current="page"' : ''} data-i18n="nav.home">${t('nav.home')}</a></li>
      <li><a href="/tours" ${activePath.startsWith('/tours') ? 'aria-current="page"' : ''} data-i18n="nav.tours">${t('nav.tours')}</a></li>
      <li><a href="/about" ${activePath === '/about' ? 'aria-current="page"' : ''} data-i18n="nav.about">${t('nav.about')}</a></li>
      <li><a href="/contact" ${activePath === '/contact' ? 'aria-current="page"' : ''} data-i18n="nav.contact">${t('nav.contact')}</a></li>
      <li><a href="/booking" data-i18n="nav.book">${t('nav.book')}</a></li>
    </ul>

    <div style="margin-top: var(--space-6); display: flex; gap: var(--space-3);">
      <button type="button" class="btn btn--outline btn--block" data-theme-toggle-mobile>${t('a11y.toggleTheme')}</button>
      <button type="button" class="btn btn--outline btn--block" data-lang-toggle-mobile>${t('lang.switchTo')}</button>
    </div>
  `;

  return nav;
}

function bindMobileNav(header, mobileNav) {
  const openBtn = header.querySelector('[data-mobile-nav-open]');
  const closeBtn = mobileNav.querySelector('[data-mobile-nav-close]');

  function open() {
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (openBtn) openBtn.focus();
  }

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      close();
    }
  });
}

function bindLanguageToggles(header, mobileNav) {
  const originalToggle = header.querySelector('[data-lang-toggle]');
  const mobileToggle = mobileNav.querySelector('[data-lang-toggle-mobile]');

  if (mobileToggle) {
    mobileToggle.dataset.langToggle = '';
    const label = document.createElement('span');
    label.dataset.langLabel = '';
    label.textContent = originalToggle?.querySelector('[data-lang-label]')?.textContent || t('lang.switchTo');
    mobileToggle.textContent = '';
    mobileToggle.appendChild(label);
  }

  document.querySelectorAll('[data-lang-toggle], [data-lang-toggle-mobile]').forEach((btn) => {
    if (btn.dataset.langBound === 'true') return;
    btn.dataset.langBound = 'true';
    btn.addEventListener('click', async () => {
      const { toggleLang } = await import('/assets/js/i18n/index.js');
      toggleLang();
    });
  });
}

function bindThemeToggles(header, mobileNav) {
  const mobileToggle = mobileNav.querySelector('[data-theme-toggle-mobile]');
  if (mobileToggle) {
    mobileToggle.dataset.themeToggle = '';
    mobileToggle.textContent = t('a11y.toggleTheme');
  }

  import('/assets/js/ui/theme.js').then(({ initTheme }) => {
    initTheme();
  });
}

export function mountHeader(target = document.querySelector('[data-header]')) {
  if (!target) return;
  if (target.dataset.mounted === 'true') return;
  target.dataset.mounted = 'true';

  const activePath = getCurrentPath();
  const header = buildHeader();
  const mobileNav = buildMobileNav(activePath);

  target.innerHTML = '';
  target.appendChild(header);
  target.appendChild(mobileNav);

  bindMobileNav(header, mobileNav);
  bindLanguageToggles(header, mobileNav);
  bindThemeToggles(header, mobileNav);
}