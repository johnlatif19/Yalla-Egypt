import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { initReveals } from '/assets/js/ui/animations.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getTours, getGallery, getSettings } from '/assets/js/core/api.js';

function renderFeaturedTours(tours) {
  const grid = document.getElementById('featured-tours-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(tours) || tours.length === 0) {
    grid.innerHTML = `<p class="text-muted">${t('tours.emptyLead')}</p>`;
    return;
  }

  tours.slice(0, 6).forEach((tour) => {
    const article = document.createElement('article');
    article.className = 'card reveal';

    const cover = tour.coverImage?.url || '/assets/images/logo.webp';
    const title = tour.title?.[document.documentElement.lang] || tour.title?.en || tour.slug;
    const desc = tour.shortDescription?.[document.documentElement.lang] || tour.shortDescription?.en || '';

    article.innerHTML = `
      <div class="card__media">
        <img src="${cover}" alt="${escapeAttr(title)}" loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        <div class="card__meta">
          ${tour.category ? `<span class="badge">${escapeHtml(tour.category)}</span>` : ''}
          ${tour.duration ? `<span class="badge">${escapeHtml(tour.duration)}</span>` : ''}
        </div>
        <h3 class="card__title"><a href="/tours/${encodeURIComponent(tour.slug)}">${escapeHtml(title)}</a></h3>
        <p class="card__desc">${escapeHtml(desc)}</p>
        <div class="card__footer">
          ${tour.price != null ? `<span class="price">${escapeHtml(String(tour.price))}<span class="price__currency">${escapeHtml(tour.currency || 'EGP')}</span></span>` : '<span></span>'}
          <a href="/tours/${encodeURIComponent(tour.slug)}" class="btn btn--ghost btn--sm">${t('common.viewDetails')}</a>
        </div>
      </div>
    `;

    grid.appendChild(article);
  });
}

function renderExperiences(items) {
  const grid = document.getElementById('experiences-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    renderStaticExperiences();
    return;
  }

  items.slice(0, 6).forEach((item) => {
    const article = document.createElement('article');
    article.className = 'experience reveal';

    const lang = document.documentElement.lang;
    const title = item.title?.[lang] || item.title?.en || '';
    const desc = item.description?.[lang] || item.description?.en || '';
    const image = item.imageUrl || '/assets/images/logo.webp';

    article.innerHTML = `
      <img src="${image}" alt="${escapeAttr(title)}" loading="lazy" decoding="async">
      <div class="experience__body">
        <h3 class="experience__title">${escapeHtml(title)}</h3>
        <p class="experience__desc">${escapeHtml(desc)}</p>
      </div>
    `;

    grid.appendChild(article);
  });
}

function renderStaticExperiences() {
  const grid = document.getElementById('experiences-grid');
  if (!grid) return;

  // ظبطنا الصور هنا عشان تبقى للمتحف والأهرامات
  const staticItems = [
    { title: 'Pyramids & Ancient Wonders', desc: 'Stand before the last surviving wonder of the ancient world.', image: '/assets/images/egypt-pyramids-1.webp' },
    { title: 'Egyptian Museum Treasures', desc: 'Explore thousands of artifacts from ancient Egypt.', image: '/assets/images/egypt-museum-1.webp' },
    { title: 'Nile & Daily Life', desc: 'Sail the Nile and experience the rhythm of Egyptian life.', image: '/assets/images/egypt-nile.webp' }
  ];

  staticItems.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'experience reveal';
    article.innerHTML = `
      <img src="${item.image}" alt="${escapeAttr(item.title)}" loading="lazy" decoding="async">
      <div class="experience__body">
        <h3 class="experience__title">${escapeHtml(item.title)}</h3>
        <p class="experience__desc">${escapeHtml(item.desc)}</p>
      </div>
    `;
    grid.appendChild(article);
  });
}

function renderGallery(items) {
  const grid = document.getElementById('home-gallery-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    renderStaticGallery();
    return;
  }

  items.slice(0, 8).forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item reveal';

    const img = document.createElement('img');
    img.src = item.secureUrl || item.url;
    img.alt = item.alt?.[document.documentElement.lang] || item.alt?.en || '';
    img.loading = 'lazy';
    img.decoding = 'async';

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });
}

function renderStaticGallery() {
  const grid = document.getElementById('home-gallery-grid');
  if (!grid) return;

  // دي نفس الصور اللي انت ظبطتها في الاسكرين شوت
  const staticImages = [
    '/assets/images/egypt-museum-1.webp',
    '/assets/images/egypt-museum-2.webp',
    '/assets/images/egypt-pyramids-1.webp',
    '/assets/images/egypt-hero.webp',
    '/assets/images/egypt-food.webp',
    '/assets/images/egypt-nile.webp'
  ];

  staticImages.forEach((src) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery-item reveal';

    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Egypt';
    img.loading = 'lazy';
    img.decoding = 'async';

    wrapper.appendChild(img);
    grid.appendChild(wrapper);
  });
}

function renderGuide(settings) {
  const nameEl = document.getElementById('home-guide-name');
  const bioEl = document.getElementById('home-guide-bio');
  const photoEl = document.getElementById('home-guide-photo');

  if (!nameEl || !bioEl || !photoEl) return;

  const guide = settings?.guide || {};
  const lang = document.documentElement.lang;

  if (guide.name) {
    nameEl.textContent = guide.name;
  }

  if (guide.bio) {
    const bioText = typeof guide.bio === 'object'
      ? guide.bio[lang] || guide.bio.en || ''
      : guide.bio;
    bioEl.textContent = bioText;
  }

  if (guide.photoUrl) {
    photoEl.innerHTML = '';
    const img = document.createElement('img');
    img.src = guide.photoUrl;
    img.alt = guide.name || 'Yalla Egypt guide';
    img.loading = 'lazy';
    photoEl.appendChild(img);
  }
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

function hideIntro() {
  const splash = document.getElementById('intro-splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('is-hidden');
    }, 4200);
  }
}

async function loadHome() {
  try {
    const [toursData, galleryData, settings] = await Promise.all([
      getTours({ featured: true, limit: 6 }),
      getGallery({ limit: 8 }),
      getSettings()
    ]);

    renderFeaturedTours(toursData?.items || []);
    renderGallery(galleryData?.items || []);
    renderExperiences(settings?.experiences || []);
    renderGuide(settings);
    initReveals();
  } catch (error) {
    showToast(error.message || t('common.error'), 'error');
    initReveals();
  }
}

async function init() {
  hideIntro();
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  
  // عشان نضمن إن الصور تظهر فوراً بعد الإنترو
  renderStaticExperiences();
  renderStaticGallery();
  
  initReveals();
  await loadHome();
}

init();
