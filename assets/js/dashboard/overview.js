import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { adminGetStats, adminGetBookings } from '/assets/js/core/api.js';
import { initGuard, mountLogoutButton } from './guard.js';
import { formatDate, formatNumber, statusLabel } from './_helpers.js';

async function renderStats(stats) {
  const map = {
    totalTours: stats?.totalTours ?? 0,
    publishedTours: stats?.publishedTours ?? 0,
    pendingBookings: stats?.pendingBookings ?? 0,
    confirmedBookings: stats?.confirmedBookings ?? 0
  };

  Object.entries(map).forEach(([key, value]) => {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (el) el.textContent = formatNumber(value);
  });
}

function renderRecentBookings(bookings) {
  const tbody = document.getElementById('recent-bookings-body');
  const emptyEl = document.getElementById('recent-bookings-empty');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!Array.isArray(bookings) || bookings.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;

  bookings.forEach((booking) => {
    const tr = document.createElement('tr');

    const refTd = document.createElement('td');
    const refLink = document.createElement('a');
    refLink.href = `/dashboard/bookings?ref=${encodeURIComponent(booking.reference || '')}`;
    refLink.textContent = booking.reference || '—';
    refTd.appendChild(refLink);

    const nameTd = document.createElement('td');
    nameTd.textContent = booking.visitor?.name || '—';

    const tourTd = document.createElement('td');
    tourTd.textContent = booking.tour?.title?.en || booking.tour?.title || '—';

    const dateTd = document.createElement('td');
    dateTd.textContent = booking.requestedDate ? formatDate(booking.requestedDate) : '—';

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge badge--${statusBadgeClass(booking.status)}`;
    badge.textContent = statusLabel(booking.status);
    statusTd.appendChild(badge);

    tr.appendChild(refTd);
    tr.appendChild(nameTd);
    tr.appendChild(tourTd);
    tr.appendChild(dateTd);
    tr.appendChild(statusTd);

    tbody.appendChild(tr);
  });
}

function statusBadgeClass(status) {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'rejected':
    case 'cancelled': return 'danger';
    case 'completed': return 'info';
    default: return '';
  }
}

async function loadDashboard() {
  try {
    const [stats, bookings] = await Promise.all([
      adminGetStats(),
      adminGetBookings({ limit: 5, sort: 'createdAt:desc' })
    ]);
    renderStats(stats);
    renderRecentBookings(bookings?.items || []);
  } catch (error) {
    showToast(error.message || t('dashboard.loadError'), 'error');
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

  await loadDashboard();
}

init();