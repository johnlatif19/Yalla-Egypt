import { t } from '/assets/js/i18n/index.js';
import { getSettings } from '/assets/js/core/api.js';

function buildFooter(settings) {
  const contact = settings?.contact || {};
  const social = settings?.social || {};
  const brand = settings?.brandName || {};

  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  const socialItems = [
    { label: 'Instagram', url: social.instagram },
    { label: 'Facebook', url: social.facebook },
    { label: 'TikTok', url: social.tiktok }
  ].filter((item) => item.url);

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="/" class="brand" aria-label="Yalla Egypt" style="margin-bottom: var(--space-3); display: inline-flex;">
            <img src="/assets/images/logo.webp" alt="Yalla Egypt" height="40" width="auto">
          </a>
          <p class="text-muted" style="font-size: var(--fs-sm); max-width: 320px;">
            ${escapeHtml(brand.en || brand.ar || t('footer.builtBy'))}
          </p>
          ${contact.email ? `<p style="margin-top: var(--space-3); font-size: var(--fs-sm);"><a href="mailto:${encodeURIComponent(contact.email)}">${escapeHtml(contact.email)}</a></p>` : ''}
          ${contact.phone ? `<p style="font-size: var(--fs-sm);"><a href="tel:${encodeURIComponent(contact.phone.replace(/\s+/g, ''))}">${escapeHtml(contact.phone)}</a></p>` : ''}
        </div>

        <div>
          <h4 style="font-size: var(--fs-sm); margin-bottom: var(--space-3); font-family: var(--font-body); font-weight: var(--fw-semibold);" data-i18n="footer.tours">${t('footer.tours')}</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--fs-sm);">
            <li><a href="/tours" class="text-muted" data-i18n="nav.tours">${t('nav.tours')}</a></li>
            <li><a href="/about" class="text-muted" data-i18n="nav.about">${t('nav.about')}</a></li>
            <li><a href="/booking" class="text-muted" data-i18n="nav.book">${t('nav.book')}</a></li>
          </ul>
        </div>

        <div>
          <h4 style="font-size: var(--fs-sm); margin-bottom: var(--space-3); font-family: var(--font-body); font-weight: var(--fw-semibold);" data-i18n="footer.contact">${t('footer.contact')}</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--fs-sm);">
            <li><a href="/contact" class="text-muted" data-i18n="nav.contact">${t('nav.contact')}</a></li>
            ${socialItems.map((item) => `<li><a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="text-muted">${escapeHtml(item.label)}</a></li>`).join('')}
          </ul>
        </div>
      </div>

      <hr class="divider">

      <div class="flex items-center justify-between flex-wrap gap-3">
        <p class="text-subtle" style="font-size: var(--fs-xs);">
          &copy; ${new Date().getFullYear()} Yalla Egypt. <span data-i18n="footer.rights">${t('footer.rights')}</span>
        </p>
        <a href="/login" class="text-subtle" style="font-size: var(--fs-xs);" data-i18n="nav.login">${t('nav.login')}</a>
      </div>
    </div>
  `;

  return footer;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

export async function mountFooter(target = document.querySelector('[data-footer]')) {
  if (!target) return;
  if (target.dataset.mounted === 'true') return;
  target.dataset.mounted = 'true';

  let settings = null;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }

  target.innerHTML = '';
  target.appendChild(buildFooter(settings));
}