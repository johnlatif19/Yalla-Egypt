import { initI18n, t } from '/assets/js/i18n/index.js';
import { initTheme } from '/assets/js/ui/theme.js';
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

// كود زرار العين عشان تشوف الباسورد
function initPasswordToggle() {
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-password');
  const eyeIcon = document.getElementById('eye-icon');

  if (toggleBtn && passwordInput && eyeIcon) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // تغيير شكل الأيقونة
      if (type === 'text') {
        eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      } else {
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });
  }
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
    // تصليح المشكلة: رجع الزرار لحالته الطبيعية لو حصل خطأ
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
  initPasswordToggle(); // تفعيل زرار رؤية الباسورد

  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

init();
