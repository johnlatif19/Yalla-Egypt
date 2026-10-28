import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { initReveals } from '/assets/js/ui/animations.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getSettings } from '/assets/js/core/api.js';

async function loadGuide() {
  const nameEl = document.getElementById('guide-name');
  const bioEl = document.getElementById('guide-bio');
  const photoWrapper = document.getElementById('guide-photo-wrapper');
  const languagesWrapper = document.getElementById('guide-languages-wrapper');
  const languagesEl = document.getElementById('guide-languages');
  const specialtiesWrapper = document.getElementById('guide-specialties-wrapper');
  const specialtiesEl = document.getElementById('guide-specialties');

  try {
    const settings = await getSettings();
    const guide = settings?.guide || {};
    const lang = document.documentElement.lang;

    if (guide.name && nameEl) {
      nameEl.textContent = guide.name;
      nameEl.removeAttribute('data-i18n');
    }

    if (bioEl) {
      if (guide.bio) {
        const bioText = typeof guide.bio === 'object'
          ? guide.bio[lang] || guide.bio.en || ''
          : guide.bio;
        bioEl.textContent = bioText;
        bioEl.classList.remove('text-muted');
      } else {
        bioEl.innerHTML = `<p class="text-muted">${t('about.noBio')}</p>`;
      }
    }

    if (photoWrapper) {
      photoWrapper.innerHTML = '';
      const img = document.createElement('img');
      if (guide.photoUrl) {
        img.src = guide.photoUrl;
        img.alt = guide.name ? `${guide.name} — Yalla Egypt` : 'Yalla Egypt guide';
      } else {
        img.src = '/assets/images/logo.webp';
        img.alt = 'Yalla Egypt';
        img.style.objectFit = 'contain';
        img.style.padding = 'var(--space-8)';
      }
      img.loading = 'lazy';
      img.decoding = 'async';
      photoWrapper.appendChild(img);
    }

    if (Array.isArray(guide.languages) && guide.languages.length && languagesWrapper && languagesEl) {
      languagesWrapper.hidden = false;
      languagesEl.innerHTML = '';
      guide.languages.forEach((item) => {
        const span = document.createElement('span');
        span.className = 'badge badge--accent';
        span.textContent = typeof item === 'string' ? item : (item.name || '');
        languagesEl.appendChild(span);
      });
    }

    if (Array.isArray(guide.specialties) && guide.specialties.length && specialtiesWrapper && specialtiesEl) {
      specialtiesWrapper.hidden = false;
      specialtiesEl.innerHTML = '';
      guide.specialties.forEach((item) => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = typeof item === 'string' ? item : (item.name || '');
        specialtiesEl.appendChild(span);
      });
    }
  } catch (error) {
    if (bioEl) {
      bioEl.innerHTML = `<p class="text-muted">${t('about.loadError')}</p>`;
    }
    showToast(error.message || t('common.error'), 'error');
  }
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  initReveals();
  await loadGuide();
}

init();