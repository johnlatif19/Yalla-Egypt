import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
import { showToast } from '/assets/js/ui/toast.js';
import { signIn, isAdmin, getCurrentUser } from '/assets/js/core/auth.js';

let submitting = false;

function showAlert(message, type = 'danger') {
  const alert = document.getElementById('login-alert');
  if (!alert) return;
  alert.className = `alert alert--${type}`;
  alert.textContent = message;
  alert.hidden = false;
}

function hideAlert() {
  const alert = document.getElementById('login-alert');
  if (alert) alert.hidden = true;
}

function setSubmitting(value) {
  submitting = value;
  const btn = document.getElementById('login-submit-btn');
  const label = document.getElementById('login-submit-label');
  const spinner = document.getElementById('login-submit-spinner');
  if (btn) btn.disabled = value;
  if (label) label.textContent = value ? t('login.submitting') : t('login.submitButton');
  if (spinner) spinner.hidden = !value;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;

  hideAlert();

  const formData = new FormData(event.target);
  const email = formData.get('email')?.toString().trim() || '';
  const password = formData.get('password')?.toString() || '';

  if (!email || !password) {
    showAlert(t('booking.validationRequired'), 'danger');
    return;
  }

  setSubmitting(true);

  try {
    const user = await signIn(email, password);
    const admin = await isAdmin();
    if (!admin) {
      showAlert(t('login.errorNotAdmin'), 'danger');
      const { signOut } = await import('/assets/js/core/auth.js');
      await signOut();
      setSubmitting(false);
      return;
    }
    window.location.replace('/dashboard');
  } catch (error) {
    const code = error.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      showAlert(t('login.errorInvalid'), 'danger');
    } else {
      showAlert(error.message || t('login.errorGeneric'), 'danger');
    }
    setSubmitting(false);
  }
}

async function redirectIfAlreadySignedIn() {
  try {
    const user = await getCurrentUser();
    if (!user) return;
    const admin = await isAdmin();
    if (admin) {
      window.location.replace('/dashboard');
    }
  } catch {
    // ignore
  }
}

function init() {
  initTheme();
  initI18n();
  redirectIfAlreadySignedIn();

  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

init();