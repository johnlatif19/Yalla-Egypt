import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getTours, createBooking } from '/assets/js/core/api.js';
import { getQueryParam, navigate } from '/assets/js/core/router.js';
import { config } from '/assets/js/core/config.js';

let toursCache = [];
let submitting = false;

async function loadTours() {
  const select = document.getElementById('tour');
  if (!select) return;

  try {
    const data = await getTours({ pageSize: 200, published: true });
    toursCache = data?.items || [];

    const current = select.value;
    select.innerHTML = `<option value="">${t('booking.tourPlaceholder')}</option>`;

    toursCache.forEach((tour) => {
      const option = document.createElement('option');
      option.value = tour.slug;
      option.textContent = tour.title?.[document.documentElement.lang] || tour.title?.en || tour.slug;
      option.dataset.title = option.textContent;
      option.dataset.duration = tour.duration || '';
      option.dataset.price = tour.price != null ? String(tour.price) : '';
      option.dataset.currency = tour.currency || '';
      select.appendChild(option);
    });

    const preselect = getQueryParam('tour');
    if (preselect) {
      select.value = preselect;
      updateSummary();
    } else if (current) {
      select.value = current;
    }
  } catch (error) {
    showToast(error.message || t('tours.errorLoad'), 'error');
  }
}

function updateSummary() {
  const select = document.getElementById('tour');
  const summary = document.getElementById('booking-summary');
  const titleEl = document.getElementById('summary-tour-title');
  const durationEl = document.getElementById('summary-tour-duration');
  const priceRow = document.getElementById('summary-price-row');
  const priceEl = document.getElementById('summary-tour-price');

  if (!select || !summary) return;

  const option = select.options[select.selectedIndex];
  if (!option || !option.value) {
    summary.hidden = true;
    return;
  }

  summary.hidden = false;
  if (titleEl) titleEl.textContent = option.dataset.title || option.textContent;
  if (durationEl) durationEl.textContent = option.dataset.duration || '—';

  if (option.dataset.price) {
    priceRow.hidden = false;
    if (priceEl) priceEl.textContent = `${option.dataset.price} ${option.dataset.currency || ''}`.trim();
  } else {
    priceRow.hidden = true;
  }
}

function setMinDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

function showFieldError(fieldId, messageKey) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (input) input.setAttribute('aria-invalid', 'true');
  if (errorEl) {
    errorEl.textContent = t(messageKey);
    errorEl.hidden = false;
  }
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (input) input.removeAttribute('aria-invalid');
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
}

function clearAllErrors() {
  ['tour', 'date', 'adults', 'name', 'email', 'phone', 'consent'].forEach(clearFieldError);
}

function showAlert(message, type = 'danger') {
  const alert = document.getElementById('booking-alert');
  if (!alert) return;
  alert.className = `alert alert--${type}`;
  alert.textContent = message;
  alert.hidden = false;
  alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideAlert() {
  const alert = document.getElementById('booking-alert');
  if (alert) alert.hidden = true;
}

function validateForm() {
  let valid = true;

  const tour = document.getElementById('tour');
  if (!tour || !tour.value) {
    showFieldError('tour', 'booking.validationTour');
    valid = false;
  }

  const date = document.getElementById('date');
  if (!date || !date.value) {
    showFieldError('date', 'booking.validationRequired');
    valid = false;
  } else {
    const selected = new Date(date.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      showFieldError('date', 'booking.validationDatePast');
      valid = false;
    }
  }

  const adults = document.getElementById('adults');
  if (!adults || !adults.value || Number(adults.value) < 1) {
    showFieldError('adults', 'booking.validationAdults');
    valid = false;
  }

  const name = document.getElementById('name');
  if (!name || !name.value.trim()) {
    showFieldError('name', 'booking.validationRequired');
    valid = false;
  }

  const email = document.getElementById('email');
  if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showFieldError('email', 'booking.validationEmail');
    valid = false;
  }

  const phone = document.getElementById('phone');
  if (!phone || !phone.value.trim() || phone.value.replace(/\D/g, '').length < 7) {
    showFieldError('phone', 'booking.validationPhone');
    valid = false;
  }

  const consent = document.getElementById('consent');
  if (!consent || !consent.checked) {
    showFieldError('consent', 'booking.validationConsent');
    valid = false;
  }

  return valid;
}

function setSubmitting(value) {
  submitting = value;
  const btn = document.getElementById('submit-btn');
  const label = document.getElementById('submit-btn-label');
  const spinner = document.getElementById('submit-btn-spinner');
  if (btn) btn.disabled = value;
  if (label) label.textContent = value ? t('booking.submitting') : t('booking.submitButton');
  if (spinner) spinner.hidden = !value;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;

  hideAlert();
  clearAllErrors();

  if (!validateForm()) {
    const firstInvalid = document.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const form = event.target;
  const formData = new FormData(form);

  const payload = {
    tourSlug: formData.get('tour')?.toString() || '',
    date: formData.get('date')?.toString() || '',
    adults: Number(formData.get('adults')) || 1,
    children: Number(formData.get('children')) || 0,
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    contactMethod: formData.get('contactMethod')?.toString() || 'email',
    language: formData.get('language')?.toString() || 'en',
    pickup: formData.get('pickup')?.toString().trim() || '',
    notes: formData.get('notes')?.toString().trim() || '',
    consent: Boolean(formData.get('consent'))
  };

  setSubmitting(true);

  try {
    const result = await createBooking(payload);

    const summary = {
      reference: result?.reference || '',
      tourTitle: result?.tour?.title || '',
      date: payload.date,
      adults: payload.adults,
      children: payload.children
    };

    try {
      sessionStorage.setItem(config.storageKeys.lastBooking, JSON.stringify(summary));
    } catch {
      // ignore
    }

    navigate(`/booking/confirmation?ref=${encodeURIComponent(summary.reference)}`);
  } catch (error) {
    if (error.status === 409) {
      showAlert(t('booking.errorDuplicate'), 'warning');
    } else if (error.status === 400) {
      showAlert(error.message || t('booking.errorGeneric'), 'danger');
    } else {
      showAlert(error.message || t('booking.errorGeneric'), 'danger');
    }
    setSubmitting(false);
  }
}

function bindForm() {
  const form = document.getElementById('booking-form');
  const tourSelect = document.getElementById('tour');

  if (tourSelect) {
    tourSelect.addEventListener('change', updateSummary);
  }

  if (form) {
    form.addEventListener('submit', handleSubmit);

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.id) clearFieldError(input.id);
      });
    });
  }
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  setMinDate();
  await loadTours();
  bindForm();
  updateSummary();
}

init();