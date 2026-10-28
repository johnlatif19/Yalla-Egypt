const API_BASE = '/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
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
