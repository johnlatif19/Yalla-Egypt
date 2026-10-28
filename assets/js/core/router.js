const PAGE_MAP = {
  '/': 'home',
  '/tours': 'tours',
  '/about': 'about',
  '/contact': 'contact',
  '/booking': 'booking',
  '/booking/confirmation': 'booking-confirmation',
  '/login': 'login',
  '/dashboard': 'dashboard',
  '/dashboard/tours': 'dashboard-tours',
  '/dashboard/bookings': 'dashboard-bookings',
  '/dashboard/gallery': 'dashboard-gallery',
  '/dashboard/settings': 'dashboard-settings'
};

export function getCurrentPath() {
  let path = window.location.pathname.replace(/\/+$/, '');
  if (!path) path = '/';
  return path;
}

export function getCurrentPage() {
  const path = getCurrentPath();
  if (PAGE_MAP[path]) return PAGE_MAP[path];
  if (/^\/tours\/[^/]+$/.test(path)) return 'tour-details';
  return null;
}

export function getTourSlugFromPath() {
  const path = getCurrentPath();
  const match = path.match(/^\/tours\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.location.replace(path);
  } else {
    window.location.assign(path);
  }
}

export function navigateToTour(slug) {
  navigate(`/tours/${encodeURIComponent(slug)}`);
}

export function goBack(fallback = '/') {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate(fallback);
  }
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function setQueryParams(params, { replace = true } = {}) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  if (replace) {
    window.history.replaceState({}, '', url.toString());
  } else {
    window.history.pushState({}, '', url.toString());
  }
}