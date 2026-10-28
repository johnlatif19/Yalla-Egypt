const API_BASE = '/api';

const firebaseConfig = {
  apiKey: window.__FIREBASE_API_KEY__ || '',
  authDomain: window.__FIREBASE_AUTH_DOMAIN__ || '',
  projectId: window.__FIREBASE_PROJECT_ID__ || '',
  storageBucket: window.__FIREBASE_STORAGE_BUCKET__ || '',
  messagingSenderId: window.__FIREBASE_MESSAGING_SENDER_ID__ || '',
  appId: window.__FIREBASE_APP_ID__ || ''
};

export const config = {
  apiBase: API_BASE,
  firebase: firebaseConfig,
  storageKeys: {
    theme: 'yalla-theme',
    lang: 'yalla-lang',
    bookingDraft: 'yalla-booking-draft',
    lastBooking: 'yalla-last-booking'
  },
  defaultLang: 'en',
  supportedLangs: ['en', 'ar'],
  bookingStatuses: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed']
};