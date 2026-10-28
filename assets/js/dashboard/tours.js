import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { openModal, closeModal } from '/assets/js/ui/modal.js';
import {
  adminGetTours,
  adminGetTour,
  adminCreateTour,
  adminUpdateTour,
  adminDeleteTour,
  adminUploadImage
} from '/assets/js/core/api.js';
import { initGuard, mountLogoutButton } from './guard.js';
import { formatDate } from './_helpers.js';

const state = {
  items: [],
  filters: { search: '', published: '' },
  page: 1,
  pageSize: 20
};

function renderTable() {
  const tbody = document.getElementById('tours-table-body');
  const emptyEl = document.getElementById('tours-empty');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!state.items.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  state.items.forEach((tour) => {
    const tr = document.createElement('tr');

    const titleTd = document.createElement('td');
    titleTd.textContent = tour.title?.en || tour.slug || '—';

    const slugTd = document.createElement('td');
    slugTd.textContent = tour.slug || '—';

    const categoryTd = document.createElement('td');
    categoryTd.textContent = tour.category || '—';

    const priceTd = document.createElement('td');
    priceTd.textContent = tour.price != null
      ? `${tour.price} ${tour.currency || ''}`.trim()
      : '—';

    const publishedTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge badge--${tour.published ? 'success' : 'warning'}`;
    badge.textContent = tour.published ? t('dashboard.published') : t('dashboard.draft');
    publishedTd.appendChild(badge);

    const updatedTd = document.createElement('td');
    updatedTd.textContent = tour.updatedAt ? formatDate(tour.updatedAt) : '—';

    const actionsTd = document.createElement('td');
    actionsTd.className = 'data-table__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn';
    editBtn.setAttribute('aria-label', t('dashboard.edit'));
    editBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.addEventListener('click', () => openTourEditor(tour.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'icon-btn';
    deleteBtn.setAttribute('aria-label', t('dashboard.delete'));
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>';
    deleteBtn.addEventListener('click', () => confirmDelete(tour));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(titleTd);
    tr.appendChild(slugTd);
    tr.appendChild(categoryTd);
    tr.appendChild(priceTd);
    tr.appendChild(publishedTd);
    tr.appendChild(updatedTd);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

async function loadTours() {
  try {
    const data = await adminGetTours({
      search: state.filters.search || undefined,
      published: state.filters.published || undefined,
      page: state.page,
      pageSize: state.pageSize
    });
    state.items = data?.items || [];
    renderTable();
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

function confirmDelete(tour) {
  const content = document.createElement('div');
  content.innerHTML = `<p>${t('dashboard.deleteTourConfirm')}</p><p style="margin-top: var(--space-2); font-weight: var(--fw-semibold);">${tour.title?.en || tour.slug}</p>`;

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = 'var(--space-3)';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn btn--outline';
  cancel.textContent = t('dashboard.cancel');
  cancel.addEventListener('click', closeModal);

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'btn btn--danger';
  confirm.textContent = t('dashboard.delete');
  confirm.addEventListener('click', async () => {
    try {
      await adminDeleteTour(tour.id);
      showToast(t('dashboard.deletedSuccess'), 'success');
      closeModal();
      await loadTours();
    } catch (error) {
      showToast(error.message || t('dashboard.deleteError'), 'error');
    }
  });

  footer.appendChild(cancel);
  footer.appendChild(confirm);

  openModal({
    title: t('dashboard.deleteTourTitle'),
    content,
    footer
  });
}

function buildEditorForm(tour = {}) {
  const wrapper = document.createElement('form');
  wrapper.id = 'tour-editor-form';
  wrapper.className = 'editor-grid';
  wrapper.noValidate = true;

  wrapper.innerHTML = `
    <div class="editor-main">
      <div class="dashboard-panel">
        <div class="dashboard-panel__header">
          <h3 class="dashboard-panel__title">${t('dashboard.contentSection')}</h3>
        </div>
        <div class="dashboard-panel__body">
          <div class="lang-tabs" role="tablist">
            <button type="button" class="lang-tabs__tab" role="tab" data-lang-tab="en" aria-selected="true">English</button>
            <button type="button" class="lang-tabs__tab" role="tab" data-lang-tab="ar" aria-selected="false">العربية</button>
          </div>

          <div data-lang-panel="en">
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.titleEn')}</label>
              <input type="text" name="titleEn" class="form-input" value="${escapeAttr(tour.title?.en || '')}" required>
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.shortDescEn')}</label>
              <textarea name="shortDescEn" class="form-textarea" rows="2">${escapeText(tour.shortDescription?.en || '')}</textarea>
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.fullDescEn')}</label>
              <textarea name="fullDescEn" class="form-textarea" rows="5">${escapeText(tour.description?.en || '')}</textarea>
            </div>
          </div>

          <div data-lang-panel="ar" hidden>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.titleAr')}</label>
              <input type="text" name="titleAr" class="form-input" dir="rtl" value="${escapeAttr(tour.title?.ar || '')}">
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.shortDescAr')}</label>
              <textarea name="shortDescAr" class="form-textarea" dir="rtl" rows="2">${escapeText(tour.shortDescription?.ar || '')}</textarea>
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.fullDescAr')}</label>
              <textarea name="fullDescAr" class="form-textarea" dir="rtl" rows="5">${escapeText(tour.description?.ar || '')}</textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel">
        <div class="dashboard-panel__header">
          <h3 class="dashboard-panel__title">${t('dashboard.detailsSection')}</h3>
        </div>
        <div class="dashboard-panel__body">
          <div class="form-row form-row--2">
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.slugLabel')}</label>
              <input type="text" name="slug" class="form-input" value="${escapeAttr(tour.slug || '')}" required pattern="[a-z0-9-]+">
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.categoryLabel')}</label>
              <input type="text" name="category" class="form-input" value="${escapeAttr(tour.category || '')}">
            </div>
          </div>
          <div class="form-row form-row--2">
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.durationLabel')}</label>
              <input type="text" name="duration" class="form-input" value="${escapeAttr(tour.duration || '')}">
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.locationLabel')}</label>
              <input type="text" name="location" class="form-input" value="${escapeAttr(tour.location || '')}">
            </div>
          </div>
          <div class="form-row form-row--3">
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.priceLabel')}</label>
              <input type="number" name="price" class="form-input" min="0" step="0.01" value="${tour.price ?? ''}">
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.currencyLabel')}</label>
              <input type="text" name="currency" class="form-input" value="${escapeAttr(tour.currency || '')}" maxlength="6">
            </div>
            <div class="field-group">
              <label class="field-group__label">${t('dashboard.publishedLabel')}</label>
              <select name="published" class="form-select">
                <option value="false" ${!tour.published ? 'selected' : ''}>${t('dashboard.draft')}</option>
                <option value="true" ${tour.published ? 'selected' : ''}>${t('dashboard.published')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="editor-sidebar">
      <div class="dashboard-panel">
        <div class="dashboard-panel__header">
          <h3 class="dashboard-panel__title">${t('dashboard.coverImage')}</h3>
        </div>
        <div class="dashboard-panel__body">
          <div class="image-uploader" data-uploader="cover">
            <input type="file" accept="image/*" hidden data-file-input="cover">
            <div class="image-uploader__preview" data-preview="cover" ${tour.coverImage ? '' : 'hidden'}>
              <img src="${tour.coverImage?.url || ''}" alt="" data-preview-img="cover">
            </div>
            <div class="image-uploader__dropzone" data-dropzone="cover">
              <svg class="image-uploader__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
              <p class="image-uploader__text">${t('dashboard.uploadImage')}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel">
        <div class="dashboard-panel__body">
          <button type="submit" class="btn btn--primary btn--block" data-save-tour>${t('dashboard.save')}</button>
        </div>
      </div>
    </div>
  `;

  const fileInput = wrapper.querySelector('[data-file-input="cover"]');
  const dropzone = wrapper.querySelector('[data-dropzone="cover"]');
  const preview = wrapper.querySelector('[data-preview="cover"]');
  const previewImg = wrapper.querySelector('[data-preview-img="cover"]');

  let coverImage = tour.coverImage || null;

  function triggerFilePicker() {
    fileInput.click();
  }

  dropzone.addEventListener('click', triggerFilePicker);

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('is-dragover');
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragover');
    const file = event.dataTransfer.files[0];
    if (file) uploadCover(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) uploadCover(file);
  });

  async function uploadCover(file) {
    try {
      const result = await adminUploadImage(file, { altEn: '', altAr: '' });
      coverImage = {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height
      };
      previewImg.src = coverImage.url;
      preview.hidden = false;
      dropzone.hidden = true;
      showToast(t('dashboard.uploadSuccess'), 'success');
    } catch (error) {
      showToast(error.message || t('dashboard.uploadError'), 'error');
    }
  }

  wrapper.querySelectorAll('[data-lang-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      wrapper.querySelectorAll('[data-lang-tab]').forEach((el) => el.setAttribute('aria-selected', 'false'));
      wrapper.querySelectorAll('[data-lang-panel]').forEach((el) => { el.hidden = true; });
      tab.setAttribute('aria-selected', 'true');
      const panel = wrapper.querySelector(`[data-lang-panel="${tab.dataset.langTab}"]`);
      if (panel) panel.hidden = false;
    });
  });

  wrapper.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(wrapper);
    const payload = {
      title: {
        en: formData.get('titleEn')?.toString().trim() || '',
        ar: formData.get('titleAr')?.toString().trim() || ''
      },
      shortDescription: {
        en: formData.get('shortDescEn')?.toString().trim() || '',
        ar: formData.get('shortDescAr')?.toString().trim() || ''
      },
      description: {
        en: formData.get('fullDescEn')?.toString().trim() || '',
        ar: formData.get('fullDescAr')?.toString().trim() || ''
      },
      slug: formData.get('slug')?.toString().trim() || '',
      category: formData.get('category')?.toString().trim() || '',
      duration: formData.get('duration')?.toString().trim() || '',
      location: formData.get('location')?.toString().trim() || '',
      price: formData.get('price') ? Number(formData.get('price')) : null,
      currency: formData.get('currency')?.toString().trim() || '',
      published: formData.get('published') === 'true',
      coverImage
    };

    const saveBtn = wrapper.querySelector('[data-save-tour]');
    saveBtn.disabled = true;
    saveBtn.textContent = t('dashboard.saving');

    try {
      if (tour.id) {
        await adminUpdateTour(tour.id, payload);
      } else {
        await adminCreateTour(payload);
      }
      showToast(t('dashboard.savedSuccess'), 'success');
      closeModal();
      await loadTours();
    } catch (error) {
      showToast(error.message || t('dashboard.saveError'), 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = t('dashboard.save');
    }
  });

  return wrapper;
}

async function openTourEditor(tourId) {
  try {
    let tour = {};
    if (tourId) {
      tour = await adminGetTour(tourId);
    }
    const form = buildEditorForm(tour);
    const footer = document.createElement('div');
    footer.style.display = 'none';
    openModal({
      title: tourId ? t('dashboard.editTour') : t('dashboard.createTour'),
      content: form,
      footer
    });
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeText(value) {
  return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initFilters() {
  const searchInput = document.getElementById('tours-search');
  const publishedSelect = document.getElementById('tours-published-filter');

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.filters.search = searchInput.value.trim();
        state.page = 1;
        loadTours();
      }, 300);
    });
  }

  if (publishedSelect) {
    publishedSelect.addEventListener('change', () => {
      state.filters.published = publishedSelect.value;
      state.page = 1;
      loadTours();
    });
  }
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  mountLogoutButton();

  const user = await initGuard();
  if (!user) return;

  const createBtn = document.getElementById('tours-create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => openTourEditor(null));
  }

  initFilters();
  await loadTours();
}

init();