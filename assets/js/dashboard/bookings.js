import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { openModal, closeModal } from '/assets/js/ui/modal.js';
import {
  adminGetBookings,
  adminGetBooking,
  adminUpdateBookingStatus,
  adminAddBookingNote
} from '/assets/js/core/api.js';
import { initGuard, mountLogoutButton } from './guard.js';
import { formatDate, formatDateTime, statusLabel, statusBadgeClass } from './_helpers.js';
import { getQueryParam, setQueryParams } from '/assets/js/core/router.js';

const state = {
  items: [],
  filters: { search: '', status: '', ref: '' },
  page: 1,
  pageSize: 20
};

function renderTable() {
  const tbody = document.getElementById('bookings-table-body');
  const emptyEl = document.getElementById('bookings-empty');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!state.items.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  state.items.forEach((booking) => {
    const tr = document.createElement('tr');

    const refTd = document.createElement('td');
    const refLink = document.createElement('a');
    refLink.href = '#';
    refLink.textContent = booking.reference || '—';
    refLink.addEventListener('click', (event) => {
      event.preventDefault();
      openBookingDetails(booking.id);
    });
    refTd.appendChild(refLink);

    const nameTd = document.createElement('td');
    nameTd.textContent = booking.visitor?.name || '—';

    const tourTd = document.createElement('td');
    tourTd.textContent = booking.tour?.title?.en || booking.tour?.title || '—';

    const dateTd = document.createElement('td');
    dateTd.textContent = booking.requestedDate ? formatDate(booking.requestedDate) : '—';

    const partyTd = document.createElement('td');
    const adults = booking.party?.adults ?? 0;
    const children = booking.party?.children ?? 0;
    partyTd.textContent = `${adults}A / ${children}C`;

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge badge--${statusBadgeClass(booking.status)}`;
    badge.textContent = statusLabel(booking.status);
    statusTd.appendChild(badge);

    const createdTd = document.createElement('td');
    createdTd.textContent = booking.createdAt ? formatDateTime(booking.createdAt) : '—';

    tr.appendChild(refTd);
    tr.appendChild(nameTd);
    tr.appendChild(tourTd);
    tr.appendChild(dateTd);
    tr.appendChild(partyTd);
    tr.appendChild(statusTd);
    tr.appendChild(createdTd);

    tbody.appendChild(tr);
  });
}

async function loadBookings() {
  try {
    const data = await adminGetBookings({
      search: state.filters.search || undefined,
      status: state.filters.status || undefined,
      ref: state.filters.ref || undefined,
      page: state.page,
      pageSize: state.pageSize,
      sort: 'createdAt:desc'
    });
    state.items = data?.items || [];
    renderTable();
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

async function openBookingDetails(bookingId) {
  try {
    const booking = await adminGetBooking(bookingId);
    const content = document.createElement('div');
    content.className = 'booking-detail-grid';

    content.innerHTML = `
      <div class="booking-detail-section">
        <h4>${t('dashboard.visitorSection')}</h4>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.nameLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.name || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.emailLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.email || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.phoneLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.phone || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.contactMethodLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.contactMethod || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.languageLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.language || '—')}</span>
        </div>
      </div>

      <div class="booking-detail-section">
        <h4>${t('dashboard.bookingSection')}</h4>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.tourLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.tour?.title?.en || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.dateLabel')}</span>
          <span class="booking-detail-row__value">${booking.requestedDate ? formatDate(booking.requestedDate) : '—'}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.partyLabel')}</span>
          <span class="booking-detail-row__value">${booking.party?.adults ?? 0} / ${booking.party?.children ?? 0}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.pickupLabel')}</span>
          <span class="booking-detail-row__value">${escapeHtml(booking.visitor?.pickup || '—')}</span>
        </div>
        <div class="booking-detail-row">
          <span class="booking-detail-row__label">${t('dashboard.statusLabel')}</span>
          <span class="booking-detail-row__value">
            <span class="badge badge--${statusBadgeClass(booking.status)}">${statusLabel(booking.status)}</span>
          </span>
        </div>
      </div>

      <div class="booking-detail-section" style="grid-column: 1 / -1;">
        <h4>${t('dashboard.notesLabel')}</h4>
        <p style="font-size: var(--fs-sm); color: var(--color-text-muted);">${escapeHtml(booking.visitor?.notes || '—')}</p>
      </div>

      <div class="booking-detail-section" style="grid-column: 1 / -1;">
        <h4>${t('dashboard.internalNotes')}</h4>
        <div class="notes-timeline" id="notes-timeline"></div>
        <div style="display: flex; gap: var(--space-2); margin-top: var(--space-3);">
          <textarea id="new-note" class="form-textarea" rows="2" placeholder="${t('dashboard.addNotePlaceholder')}"></textarea>
          <button type="button" class="btn btn--primary" id="add-note-btn">${t('dashboard.addNote')}</button>
        </div>
      </div>
    `;

    const timeline = content.querySelector('#notes-timeline');
    const notes = Array.isArray(booking.adminNotes) ? booking.adminNotes : [];
    if (notes.length === 0) {
      timeline.innerHTML = `<p class="text-muted" style="font-size: var(--fs-sm);">${t('dashboard.noNotes')}</p>`;
    } else {
      notes.forEach((note) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `
          <div class="note-item__meta">${note.createdAt ? formatDateTime(note.createdAt) : ''}</div>
          <div>${escapeHtml(note.text || '')}</div>
        `;
        timeline.appendChild(div);
      });
    }

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.gap = 'var(--space-2)';
    footer.style.flexWrap = 'wrap';

    const statuses = ['confirmed', 'rejected', 'cancelled', 'completed'];
    statuses.forEach((status) => {
      if (status === booking.status) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--outline btn--sm';
      btn.textContent = t(`dashboard.mark${capitalize(status)}`);
      btn.addEventListener('click', async () => {
        try {
          await adminUpdateBookingStatus(booking.id, status);
          showToast(t('dashboard.statusUpdated'), 'success');
          closeModal();
          await loadBookings();
        } catch (error) {
          showToast(error.message || t('dashboard.updateError'), 'error');
        }
      });
      footer.appendChild(btn);
    });

    openModal({
      title: `${t('dashboard.bookingDetails')} — ${booking.reference || ''}`,
      content,
      footer
    });

    content.querySelector('#add-note-btn').addEventListener('click', async () => {
      const textarea = content.querySelector('#new-note');
      const text = textarea.value.trim();
      if (!text) return;
      try {
        await adminAddBookingNote(booking.id, text);
        showToast(t('dashboard.noteAdded'), 'success');
        closeModal();
        await loadBookings();
      } catch (error) {
        showToast(error.message || t('dashboard.noteError'), 'error');
      }
    });
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initFilters() {
  const searchInput = document.getElementById('bookings-search');
  const statusSelect = document.getElementById('bookings-status-filter');

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.filters.search = searchInput.value.trim();
        state.page = 1;
        setQueryParams({ q: state.filters.search });
        loadBookings();
      }, 300);
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      state.filters.status = statusSelect.value;
      state.page = 1;
      setQueryParams({ status: state.filters.status });
      loadBookings();
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

  const refFromUrl = getQueryParam('ref');
  if (refFromUrl) {
    state.filters.ref = refFromUrl;
  }

  initFilters();
  await loadBookings();

  if (refFromUrl) {
    const match = state.items.find((item) => item.reference === refFromUrl);
    if (match) {
      openBookingDetails(match.id);
    }
  }
}

init();