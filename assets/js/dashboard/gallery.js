import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { openModal, closeModal } from '/assets/js/ui/modal.js';
import {
  adminGetGallery,
  adminDeleteGalleryImage,
  adminUpdateGalleryImage,
  adminUploadImage
} from '/assets/js/core/api.js';
import { initGuard, mountLogoutButton } from './guard.js';

const state = { items: [] };

function renderGrid() {
  const grid = document.getElementById('gallery-grid');
  const emptyEl = document.getElementById('gallery-empty');
  if (!grid) return;

  grid.innerHTML = '';

  if (!state.items.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  state.items.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-grid__item';

    const img = document.createElement('img');
    img.src = item.secureUrl || item.url;
    img.alt = item.alt?.en || '';
    img.loading = 'lazy';
    wrapper.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'image-grid__overlay';

    const actions = document.createElement('div');
    actions.className = 'image-grid__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.setAttribute('aria-label', t('dashboard.edit'));
    editBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.addEventListener('click', () => openEditImage(item));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', t('dashboard.delete'));
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>';
    deleteBtn.addEventListener('click', () => confirmDeleteImage(item));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    overlay.appendChild(actions);
    wrapper.appendChild(overlay);

    grid.appendChild(wrapper);
  });
}

async function loadGallery() {
  try {
    const data = await adminGetGallery();
    state.items = data?.items || [];
    renderGrid();
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

async function uploadImages(files) {
  for (const file of files) {
    try {
      await adminUploadImage(file, {});
      showToast(t('dashboard.uploadSuccess'), 'success');
    } catch (error) {
      showToast(error.message || t('dashboard.uploadError'), 'error');
    }
  }
  await loadGallery();
}

function openEditImage(item) {
  const form = document.createElement('form');
  form.innerHTML = `
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.altEn')}</label>
      <input type="text" name="altEn" class="form-input" value="${escapeAttr(item.alt?.en || '')}">
    </div>
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.altAr')}</label>
      <input type="text" name="altAr" class="form-input" dir="rtl" value="${escapeAttr(item.alt?.ar || '')}">
    </div>
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.captionEn')}</label>
      <input type="text" name="captionEn" class="form-input" value="${escapeAttr(item.caption?.en || '')}">
    </div>
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.captionAr')}</label>
      <input type="text" name="captionAr" class="form-input" dir="rtl" value="${escapeAttr(item.caption?.ar || '')}">
    </div>
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.displayOrder')}</label>
      <input type="number" name="displayOrder" class="form-input" min="0" value="${item.displayOrder ?? 0}">
    </div>
    <div class="field-group">
      <label class="field-group__label">${t('dashboard.visibility')}</label>
      <select name="visibility" class="form-select">
        <option value="public" ${item.visibility === 'public' ? 'selected' : ''}>${t('dashboard.visible')}</option>
        <option value="hidden" ${item.visibility === 'hidden' ? 'selected' : ''}>${t('dashboard.hidden')}</option>
      </select>
    </div>
  `;

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = 'var(--space-2)';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'btn btn--outline';
  cancel.textContent = t('dashboard.cancel');
  cancel.addEventListener('click', closeModal);

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'btn btn--primary';
  save.textContent = t('dashboard.save');
  save.addEventListener('click', async () => {
    const formData = new FormData(form);
    const payload = {
      alt: {
        en: formData.get('altEn')?.toString() || '',
        ar: formData.get('altAr')?.toString() || ''
      },
      caption: {
        en: formData.get('captionEn')?.toString() || '',
        ar: formData.get('captionAr')?.toString() || ''
      },
      displayOrder: Number(formData.get('displayOrder')) || 0,
      visibility: formData.get('visibility')?.toString() || 'public'
    };
    try {
      await adminUpdateGalleryImage(item.id, payload);
      showToast(t('dashboard.savedSuccess'), 'success');
      closeModal();
      await loadGallery();
    } catch (error) {
      showToast(error.message || t('dashboard.saveError'), 'error');
    }
  });

  footer.appendChild(cancel);
  footer.appendChild(save);

  openModal({
    title: t('dashboard.editImage'),
    content: form,
    footer
  });
}

function confirmDeleteImage(item) {
  const content = document.createElement('div');
  content.innerHTML = `<p>${t('dashboard.deleteImageConfirm')}</p>`;

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = 'var(--space-2)';

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
      await adminDeleteGalleryImage(item.id);
      showToast(t('dashboard.deletedSuccess'), 'success');
      closeModal();
      await loadGallery();
    } catch (error) {
      showToast(error.message || t('dashboard.deleteError'), 'error');
    }
  });

  footer.appendChild(cancel);
  footer.appendChild(confirm);

  openModal({
    title: t('dashboard.deleteImageTitle'),
    content,
    footer
  });
}

function escapeAttr(value) {
  return String(value).replace(/"/g, '&quot;');
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  mountLogoutButton();

  const user = await initGuard();
  if (!user) return;

  const fileInput = document.getElementById('gallery-upload-input');
  const uploadBtn = document.getElementById('gallery-upload-btn');

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const files = Array.from(fileInput.files || []);
      if (files.length) await uploadImages(files);
      fileInput.value = '';
    });
  }

  await loadGallery();
}

init();