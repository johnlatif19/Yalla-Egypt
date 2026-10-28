import en from './en.js';
import ar from './ar.js';
import { config } from '/assets/js/core/config.js';

const dictionaries = { en, ar };
const listeners = new Set();
let currentLang = config.defaultLang;

function normalizeLang(lang) {
  return config.supportedLangs.includes(lang) ? lang : config.defaultLang;
}

function getStoredLang() {
  try {
    const stored = localStorage.getItem(config.storageKeys.lang);
    return stored && config.supportedLangs.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function getBrowserLang() {
  const nav = navigator.language || navigator.userLanguage || 'en';
  const short = nav.slice(0, 2).toLowerCase();
  return config.supportedLangs.includes(short) ? short : config.defaultLang;
}

export function getCurrentLang() {
  return currentLang;
}

export function isRTL() {
  return currentLang === 'ar';
}

export function t(key, fallback) {
  const dict = dictionaries[currentLang] || dictionaries[config.defaultLang];
  if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
    return dict[key];
  }
  const fallbackDict = dictionaries[config.defaultLang];
  if (fallbackDict && Object.prototype.hasOwnProperty.call(fallbackDict, key)) {
    return fallbackDict[key];
  }
  return fallback !== undefined ? fallback : key;
}

export function setLang(lang, { persist = true } = {}) {
  const safe = normalizeLang(lang);
  if (safe === currentLang) {
    applyDocumentLang();
    return;
  }
  currentLang = safe;

  if (persist) {
    try {
      localStorage.setItem(config.storageKeys.lang, safe);
    } catch {
      // ignore
    }
  }

  applyDocumentLang();
  translatePage();
  updateLangToggle();
  notifyListeners();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: safe } }));
}

export function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
}

function applyDocumentLang() {
  const html = document.documentElement;
  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  const rtlSheet = document.querySelector('link[href*="rtl.css"]');
  if (rtlSheet) {
    rtlSheet.disabled = currentLang !== 'ar';
  }
}

export function translatePage(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const value = t(key);
    if (el.hasAttribute('data-i18n-attr')) {
      const attr = el.getAttribute('data-i18n-attr');
      el.setAttribute(attr, value);
    } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', value);
      } else {
        el.value = value;
      }
    } else {
      el.textContent = value;
    }
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });

  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) el.setAttribute('aria-label', t(key));
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });
}

function updateLangToggle() {
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    const nextLabel = t('lang.switchTo');
    const label = btn.querySelector('[data-lang-label]');
    if (label) {
      label.textContent = nextLabel;
    } else {
      btn.textContent = nextLabel;
    }
    btn.setAttribute('aria-label', `${t('a11y.switchLanguage')}: ${nextLabel}`);
  });
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb(currentLang);
    } catch {
      // ignore
    }
  });
}

export function onLangChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function initI18n() {
  const stored = getStoredLang();
  currentLang = stored || getBrowserLang();
  applyDocumentLang();
  translatePage();
  updateLangToggle();

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    if (btn.dataset.i18nBound === 'true') return;
    btn.dataset.i18nBound = 'true';
    btn.addEventListener('click', () => toggleLang());
  });

  document.addEventListener('langchange', () => {
    translatePage();
  });
}

export function formatNumber(value, options = {}) {
  const locale = currentLang === 'ar' ? 'ar-EG' : 'en-GB';
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(value, currency = 'EGP') {
  const locale = currentLang === 'ar' ? 'ar-EG' : 'en-GB';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${formatNumber(value)} ${currency}`;
  }
}

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = currentLang === 'ar' ? 'ar-EG' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(date);
}