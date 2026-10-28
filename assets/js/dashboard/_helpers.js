import { t } from '/assets/js/i18n/index.js';

export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const lang = document.documentElement.lang || 'en';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const lang = document.documentElement.lang || 'en';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatNumber(value) {
  const lang = document.documentElement.lang || 'en';
  const number = Number(value) || 0;
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB').format(number);
}

export function statusLabel(status) {
  return t(`status.${status}`) || status || '—';
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending': return 'warning';
    case 'rejected':
    case 'cancelled': return 'danger';
    case 'completed': return 'info';
    default: return '';
  }
}