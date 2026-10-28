import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { mountHeader } from '/assets/js/ui/header.js';
import { mountFooter } from '/assets/js/ui/footer.js';
import { initReveals } from '/assets/js/ui/animations.js';
import { showToast } from '/assets/js/ui/toast.js';
import { getSettings, sendContactMessage } from '/assets/js/core/api.js';

let submitting = false;

async function loadContactDetails() {
  try {
    const settings = await getSettings();
    const contact = settings?.contact || {};

    const emailEl = document.getElementById('contact-email');
    if (emailEl) {
      if (contact.email) {
        emailEl.innerHTML = `<a href="mailto:${encodeURIComponent(contact.email)}">${escapeHtml(contact.email)}</a>`;
      } else {
        emailEl.textContent = '—';
      }
    }

    const phoneEl = document.getElementById('contact-phone');
    if (phoneEl) {
      if (contact.phone) {
        phoneEl.innerHTML = `<a href="tel:${encodeURIComponent(contact.phone.replace(/\s+/g, ''))}">${escapeHtml(contact.phone)}</a>`;
      } else {
        phoneEl.textContent = '—';
      }
    }

    const whatsappItem = document.getElementById('contact-whatsapp-item');
    const whatsappEl = document.getElementById('contact-whatsapp');
    if (contact.whatsapp && whatsappItem && whatsappEl) {
      whatsappItem.hidden = false;
      const clean = contact.whatsapp.replace(/\D/g, '');
      whatsappEl.innerHTML = `<a href="https://wa.me/${encodeURIComponent(clean)}" target="_blank" rel="noopener noreferrer">${escapeHtml(contact.whatsapp)}</a>`;
    }

    const locationItem = document.getElementById('contact-location-item');
    const locationEl = document.getElementById('contact-location');
    if (contact.location && locationItem && locationEl) {
      locationItem.hidden = false;
      locationEl.textContent = contact.location;
    }

    const socialWrapper = document.getElementById('contact-social-wrapper');
    const socialContainer = document.getElementById('contact-social');
    const social = settings?.social || {};
    const socialItems = [
      { key: 'instagram', label: 'Instagram', url: social.instagram },
      { key: 'facebook', label: 'Facebook', url: social.facebook },
      { key: 'tiktok', label: 'TikTok', url: social.tiktok }
    ].filter((item) => item.url);

    if (socialItems.length && socialWrapper && socialContainer) {
      socialWrapper.hidden = false;
      socialContainer.innerHTML = '';
      socialItems.forEach((item) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'btn btn--outline btn--sm';
        link.textContent = item.label;
        socialContainer.appendChild(link);
      });
    }
  } catch (error) {
    showToast(error.message || t('common.error'), 'error');
  }
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

function showAlert(message, type = 'success') {
  const alert = document.getElementById('contact-alert');
  if (!alert) return;
  alert.className = `alert alert--${type}`;
  alert.textContent = message;
  alert.hidden = false;
  alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validateForm() {
  let valid = true;

  const name = document.getElementById('contact-name');
  if (!name || !name.value.trim()) {
    showFieldError('contact-name', 'booking.validationRequired');
    valid = false;
  }

  const email = document.getElementById('contact-email-input');
  if (!email || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showFieldError('contact-email-input', 'booking.validationEmail');
    valid = false;
  }

  const subject = document.getElementById('contact-subject');
  if (!subject || !subject.value.trim()) {
    showFieldError('contact-subject', 'booking.validationRequired');
    valid = false;
  }

  const message = document.getElementById('contact-message');
  if (!message || message.value.trim().length < 10) {
    showFieldError('contact-message', 'booking.validationRequired');
    valid = false;
  }

  const consent = document.getElementById('contact-consent');
  if (!consent || !consent.checked) {
    showFieldError('contact-consent', 'booking.validationConsent');
    valid = false;
  }

  return valid;
}

function setSubmitting(value) {
  submitting = value;
  const btn = document.getElementById('contact-submit-btn');
  const label = document.getElementById('contact-submit-label');
  const spinner = document.getElementById('contact-submit-spinner');
  if (btn) btn.disabled = value;
  if (label) label.textContent = value ? t('contact.submitting') : t('contact.submitButton');
  if (spinner) spinner.hidden = !value;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;

  const alert = document.getElementById('contact-alert');
  if (alert) alert.hidden = true;

  ['contact-name', 'contact-email-input', 'contact-subject', 'contact-message', 'contact-consent'].forEach(clearFieldError);

  if (!validateForm()) {
    const firstInvalid = document.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const formData = new FormData(event.target);
  const payload = {
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    subject: formData.get('subject')?.toString().trim() || '',
    message: formData.get('message')?.toString().trim() || '',
    consent: Boolean(formData.get('consent'))
  };

  setSubmitting(true);

  try {
    await sendContactMessage(payload);
    showAlert(t('contact.successMessage'), 'success');
    event.target.reset();
  } catch (error) {
    showAlert(error.message || t('contact.errorMessage'), 'danger');
  } finally {
    setSubmitting(false);
  }
}

function bindForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', handleSubmit);

  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.id) clearFieldError(input.id);
    });
  });
}

async function init() {
  initTheme();
  initI18n();
  mountHeader();
  mountFooter();
  initReveals();
  await loadContactDetails();
  bindForm();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

init();