import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { initReveals } from '/assets/js/ui/animations.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getTours } from '/assets/js/core/api.js';
import { getQueryParam, setQueryParams } from '/assets/js/core/router.js';

const state = {
  items: [],
  page: 1,
  pageSize: 12,
  hasMore: false,
  loading: false,
  filters: {
    search: getQueryParam('q') || '',
    category: getQueryParam('category') || '',
    duration: getQueryParam('duration') || '',
    priceMin: getQueryParam('priceMin') || '',
    priceMax: getQueryParam('priceMax') || '',
    sort: getQueryParam('sort') || 'newest'
  }
};

function renderTours(items, { append = false } = {}) {
  const grid = document.getElementById('tours-grid');
  const emptyEl = document.getElementById('tours-empty');
  if (!grid) return;

  if (!append) grid.innerHTML = '';

  if (!items.length && !append) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  items.forEach((tour) => {
    const article = document.createElement('article');
    article.className = 'card';

    const lang = document.documentElement.lang;
    const title = tour.title?.[lang] || tour.title?.en || tour.slug;
    const desc = tour.shortDescription?.[lang] || tour.shortDescription?.en || '';
    const cover = tour.coverImage?.url || '/assets/images/logo.webp';

    article.innerHTML = `
      <div class="card__media">
        <img src="${cover}" alt="${escapeAttr(title)}" loading="lazy" decoding="async">
      </div>
      <div class="card__body">
        <div class="card__meta">
          ${tour.category ? `<span class="badge">${escapeHtml(tour.category)}</span>` : ''}
          ${tour.duration ? `<span class="badge">${escapeHtml(tour.duration)}</span>` : ''}
          ${tour.location ? `<span class="badge">${escapeHtml(tour.location)}</span>` : ''}
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

function updateLoadMore(hasMore) {
  const btn = document.getElementById('tours-load-more');
  if (!btn) return;
  btn.hidden = !hasMore;
}

async function loadTours({ append = false } = {}) {
  if (state.loading) return;
  state.loading = true;

  const loadingEl = document.getElementById('tours-loading');
  if (loadingEl && !append) loadingEl.hidden = false;

  try {
    const query = {
      page: state.page,
      pageSize: state.pageSize,
      search: state.filters.search || undefined,
      category: state.filters.category || undefined,
      duration: state.filters.duration || undefined,
      priceMin: state.filters.priceMin || undefined,
      priceMax: state.filters.priceMax || undefined,
      sort: state.filters.sort || 'newest'
    };

    const data = await getTours(query);
    const items = data?.items || [];
    const total = data?.total ?? items.length;

    if (append) {
      state.items = [...state.items, ...items];
    } else {
      state.items = items;
    }

    renderTours(items, { append });
    state.hasMore = state.items.length < total;
    updateLoadMore(state.hasMore);
  } catch (error) {
    showToast(error.message || t('tours.errorLoad'), 'error');
  } finally {
    state.loading = false;
    if (loadingEl) loadingEl.hidden = true;
  }
}

function syncFiltersToUrl() {
  setQueryParams({
    q: state.filters.search,
    category: state.filters.category,
    duration: state.filters.duration,
    priceMin: state.filters.priceMin,
    priceMax: state.filters.priceMax,
    sort: state.filters.sort
  });
}

function bindFilters() {
  const searchInput = document.getElementById('tours-search');
  const categorySelect = document.getElementById('tours-category');
  const durationSelect = document.getElementById('tours-duration');
  const priceMin = document.getElementById('tours-price-min');
  const priceMax = document.getElementById('tours-price-max');
  const sortSelect = document.getElementById('tours-sort');
  const clearBtn = document.getElementById('tours-clear-filters');
  const loadMoreBtn = document.getElementById('tours-load-more');

  if (searchInput) {
    searchInput.value = state.filters.search;
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.filters.search = searchInput.value.trim();
        state.page = 1;
        syncFiltersToUrl();
        loadTours();
      }, 300);
    });
  }

  if (categorySelect) {
    categorySelect.value = state.filters.category;
    categorySelect.addEventListener('change', () => {
      state.filters.category = categorySelect.value;
      state.page = 1;
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (durationSelect) {
    durationSelect.value = state.filters.duration;
    durationSelect.addEventListener('change', () => {
      state.filters.duration = durationSelect.value;
      state.page = 1;
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (priceMin) {
    priceMin.value = state.filters.priceMin;
    priceMin.addEventListener('change', () => {
      state.filters.priceMin = priceMin.value;
      state.page = 1;
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (priceMax) {
    priceMax.value = state.filters.priceMax;
    priceMax.addEventListener('change', () => {
      state.filters.priceMax = priceMax.value;
      state.page = 1;
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (sortSelect) {
    sortSelect.value = state.filters.sort;
    sortSelect.addEventListener('change', () => {
      state.filters.sort = sortSelect.value;
      state.page = 1;
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.filters = { search: '', category: '', duration: '', priceMin: '', priceMax: '', sort: 'newest' };
      state.page = 1;
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = '';
      if (durationSelect) durationSelect.value = '';
      if (priceMin) priceMin.value = '';
      if (priceMax) priceMax.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      syncFiltersToUrl();
      loadTours();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      state.page += 1;
      loadTours({ append: true });
    });
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

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  bindFilters();
  await loadTours();
  initReveals();
}

init();