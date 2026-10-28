let firebaseConfig = null;

export async function loadConfig() {
  if (firebaseConfig) return firebaseConfig;
  
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    
    // لو السيرفر رجع البيانات صح
    if (data && data.firebase) {
      firebaseConfig = data.firebase;
      return firebaseConfig;
    }
    return null;
  } catch (error) {
    console.error('Failed to load Firebase config from server', error);
    return null;
  }
}

export const config = {
  apiBase: '/api',
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
