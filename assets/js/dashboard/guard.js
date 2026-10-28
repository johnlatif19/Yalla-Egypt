import { requireAdmin, onAuthChange } from '/assets/js/core/auth.js';

let currentUser = null;
let guardActive = false;

export async function initGuard() {
  if (guardActive) return currentUser;
  guardActive = true;

  currentUser = await requireAdmin();
  if (!currentUser) {
    return null;
  }

  onAuthChange(async (user) => {
    if (!user) {
      window.location.replace('/login');
      return;
    }
    const { isAdmin } = await import('/assets/js/core/auth.js');
    const admin = await isAdmin();
    if (!admin) {
      window.location.replace('/login');
    }
  });

  return currentUser;
}

export function getGuardUser() {
  return currentUser;
}

export async function logoutAndRedirect() {
  const { signOut } = await import('/assets/js/core/auth.js');
  await signOut();
  window.location.replace('/login');
}

export function mountLogoutButton(selector = '[data-logout]') {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      logoutAndRedirect();
    });
  });
}