import { initI18n, t, formatDate } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { config } from '/assets/js/core/config.js';
import { getQueryParam } from '/assets/js/core/router.js';

function readLastBooking() {
  try {
    const raw = sessionStorage.getItem(config.storageKeys.lastBooking);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderSummary(data) {
  const card = document.getElementById('confirmation-card');
  const empty = document.getElementById('confirmation-empty');
  const refWrapper = document.getElementById('reference-wrapper');
  const refValue = document.getElementById('reference-value');
  const details = document.getElementById('confirmation-details');
  const tourEl = document.getElementById('detail-tour');
  const dateEl = document.getElementById('detail-date');
  const partyEl = document.getElementById('detail-party');

  if (!data || !data.reference) {
    if (card) card.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  if (card) card.hidden = false;
  if (empty) empty.hidden = true;

  if (refWrapper) refWrapper.hidden = false;
  if (refValue) refValue.textContent = data.reference;

  if (details) details.hidden = false;
  if (tourEl) tourEl.textContent = data.tourTitle || '—';
  if (dateEl) dateEl.textContent = data.date ? formatDate(data.date) : '—';

  if (partyEl) {
    const adults = data.adults ?? 0;
    const children = data.children ?? 0;
    partyEl.textContent = `${adults} + ${children}`;
  }
}

function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();

  const refFromUrl = getQueryParam('ref');
  const stored = readLastBooking();

  if (stored && (!refFromUrl || stored.reference === refFromUrl)) {
    renderSummary(stored);
  } else if (refFromUrl) {
    renderSummary({ reference: refFromUrl });
  } else {
    renderSummary(null);
  }
}

init();