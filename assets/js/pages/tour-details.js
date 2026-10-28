import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { initReveals } from '/assets/js/ui/animations.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getTourBySlug } from '/assets/js/core/api.js';
import { getTourSlugFromPath } from '/assets/js/core/router.js';

function renderNotFound() {
  const main = document.getElementById('tour-main');
  if (!main) return;
  main.innerHTML = `
    <div class="empty-state">
      <h3>${t('tourDetails.notFoundTitle')}</h3>
      <p>${t('tourDetails.notFoundLead')}</p>
      <a href="/tours" class="btn btn--primary" style="margin-top: var(--space-4);">${t('tourDetails.backToTours')}</a>
    </div>
  `;
}

function renderTour(tour) {
  const lang = document.documentElement.lang;
  const title = tour.title?.[lang] || tour.title?.en || tour.slug;
  const shortDesc = tour.shortDescription?.[lang] || tour.shortDescription?.en || '';
  const fullDesc = tour.description?.[lang] || tour.description?.en || '';

  document.title = `${title} — Yalla Egypt`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', shortDesc || title);

  const titleEl = document.getElementById('tour-title');
  if (titleEl) titleEl.textContent = title;

  const breadcrumbEl = document.getElementById('tour-breadcrumb-title');
  if (breadcrumbEl) breadcrumbEl.textContent = title;

  const heroImg = document.getElementById('tour-hero-img');
  if (heroImg) {
    heroImg.src = tour.coverImage?.url || '/assets/images/logo.webp';
    heroImg.alt = title;
  }

  const shortEl = document.getElementById('tour-short-desc');
  if (shortEl) shortEl.textContent = shortDesc;

  const descEl = document.getElementById('tour-full-desc');
  if (descEl) {
    if (fullDesc) {
      descEl.innerHTML = fullDesc.split('\n').filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    } else {
      descEl.hidden = true;
    }
  }

  fillInfoList(tour, lang);

  renderList('tour-included-list', 'tour-included-section', tour.included, lang);
  renderList('tour-excluded-list', 'tour-excluded-section', tour.excluded, lang);
  renderItinerary(tour.itinerary, lang);
  renderFaq(tour.faq, lang);
  renderGallery(tour.gallery, lang);

  const meetingEl = document.getElementById('tour-meeting-point');
  if (meetingEl) {
    if (tour.meetingPoint) {
      meetingEl.textContent = tour.meetingPoint;
    } else {
      document.getElementById('tour-meeting-section')?.setAttribute('hidden', '');
    }
  }

  const availabilityEl = document.getElementById('tour-availability');
  if (availabilityEl) {
    if (tour.availabilityNotes) {
      availabilityEl.textContent = tour.availabilityNotes;
    } else {
      document.getElementById('tour-availability-section')?.setAttribute('hidden', '');
    }
  }

  const cancellationEl = document.getElementById('tour-cancellation');
  if (cancellationEl) {
    if (tour.cancellationPolicy) {
      cancellationEl.textContent = tour.cancellationPolicy;
    } else {
      document.getElementById('tour-cancellation-section')?.setAttribute('hidden', '');
    }
  }

  const bookBtn = document.getElementById('tour-book-btn');
  if (bookBtn) {
    bookBtn.href = `/booking?tour=${encodeURIComponent(tour.slug)}`;
  }

  const priceEl = document.getElementById('tour-price');
  if (priceEl) {
    if (tour.price != null) {
      priceEl.textContent = `${tour.price} ${tour.currency || ''}`.trim();
    } else {
      priceEl.textContent = '—';
    }
  }

  initReveals();
}

function fillInfoList(tour, lang) {
  const list = document.getElementById('tour-info-list');
  if (!list) return;
  list.innerHTML = '';

  const rows = [
    { label: t('tourDetails.durationLabel'), value: tour.duration },
    { label: t('tourDetails.locationLabel'), value: tour.location },
    { label: t('tourDetails.categoryLabel'), value: tour.category }
  ];

  rows.forEach(({ label, value }) => {
    if (!value) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="tour-info-list__label">${escapeHtml(label)}</span>
      <span class="tour-info-list__value">${escapeHtml(value)}</span>
    `;
    list.appendChild(li);
  });
}

function renderList(listId, sectionId, items, lang) {
  const list = document.getElementById(listId);
  const section = document.getElementById(sectionId);
  if (!list || !section) return;

  list.innerHTML = '';

  const normalized = Array.isArray(items)
    ? items.map((item) => {
        if (typeof item === 'string') return item;
        return item?.[lang] || item?.en || '';
      }).filter(Boolean)
    : [];

  if (!normalized.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  normalized.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

function renderItinerary(itinerary, lang) {
  const list = document.getElementById('tour-itinerary-list');
  const section = document.getElementById('tour-itinerary-section');
  if (!list || !section) return;

  list.innerHTML = '';

  const normalized = Array.isArray(itinerary)
    ? itinerary.map((step) => {
        if (typeof step === 'string') return step;
        return step?.[lang] || step?.en || '';
      }).filter(Boolean)
    : [];

  if (!normalized.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  normalized.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

function renderFaq(faq, lang) {
  const list = document.getElementById('tour-faq-list');
  const section = document.getElementById('tour-faq-section');
  if (!list || !section) return;

  list.innerHTML = '';

  const normalized = Array.isArray(faq) ? faq : [];

  if (!normalized.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  normalized.forEach((item) => {
    const question = item?.question?.[lang] || item?.question?.en || '';
    const answer = item?.answer?.[lang] || item?.answer?.en || '';
    if (!question) return;

    const div = document.createElement('div');
    div.className = 'faq__item';
    div.innerHTML = `
      <button type="button" class="faq__question" aria-expanded="false">
        <span>${escapeHtml(question)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="faq__answer">${escapeHtml(answer)}</div>
    `;
    const btn = div.querySelector('.faq__question');
    btn.addEventListener('click', () => {
      const isOpen = div.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    list.appendChild(div);
  });
}

function renderGallery(gallery, lang) {
  const wrapper = document.getElementById('tour-gallery');
  const section = document.getElementById('tour-gallery-section');
  if (!wrapper || !section) return;

  wrapper.innerHTML = '';

  const items = Array.isArray(gallery) ? gallery : [];
  if (!items.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  items.forEach((item) => {
    const img = document.createElement('img');
    img.src = item.url || item.secureUrl;
    img.alt = item.alt?.[lang] || item.alt?.en || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrapper.appendChild(img);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();

  const slug = getTourSlugFromPath();
  if (!slug) {
    renderNotFound();
    return;
  }

  const loadingEl = document.getElementById('tour-loading');
  if (loadingEl) loadingEl.hidden = false;

  try {
    const tour = await getTourBySlug(slug);
    if (!tour) {
      renderNotFound();
      return;
    }
    renderTour(tour);
  } catch (error) {
    if (error.status === 404) {
      renderNotFound();
    } else {
      showToast(error.message || t('common.error'), 'error');
      renderNotFound();
    }
  } finally {
    if (loadingEl) loadingEl.hidden = true;
  }
}

init();