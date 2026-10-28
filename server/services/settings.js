import { db } from './firestore.js';
import { getFirebaseAdmin } from '../config/firebase.js';
import { sanitizeString } from '../middleware/validate.js';

const DOC_ID = 'site';

const DEFAULT_SETTINGS = {
  brandName: { en: 'Yalla Egypt', ar: 'يلا مصر' },
  contact: { email: '', phone: '', whatsapp: '', location: '' },
  guide: { name: '', bio: { en: '', ar: '' }, languages: [], specialties: [], photoUrl: null },
  social: { instagram: '', facebook: '', tiktok: '' },
  currency: { default: 'EGP' },
  seo: { title: { en: '', ar: '' }, description: { en: '', ar: '' } },
  experiences: []
};

export async function getSettings() {
  const doc = await db().collection('settings').doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  const data = doc.data() || {};
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    brandName: { ...DEFAULT_SETTINGS.brandName, ...(data.brandName || {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact || {}) },
    guide: { ...DEFAULT_SETTINGS.guide, ...(data.guide || {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(data.social || {}) },
    currency: { ...DEFAULT_SETTINGS.currency, ...(data.currency || {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(data.seo || {}) },
    experiences: Array.isArray(data.experiences) ? data.experiences : []
  };
}

export function getPublicSettings(settings) {
  return {
    brandName: settings.brandName,
    contact: settings.contact,
    guide: settings.guide,
    social: settings.social,
    currency: settings.currency,
    seo: settings.seo,
    experiences: settings.experiences
  };
}

export async function updateSettings(input) {
  const docRef = db().collection('settings').doc(DOC_ID);
  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();

  const payload = {
    brandName: {
      en: sanitizeString(input.brandName?.en, 120),
      ar: sanitizeString(input.brandName?.ar, 120)
    },
    contact: {
      email: sanitizeString(input.contact?.email, 180),
      phone: sanitizeString(input.contact?.phone, 32),
      whatsapp: sanitizeString(input.contact?.whatsapp, 32),
      location: sanitizeString(input.contact?.location, 120)
    },
    guide: {
      name: sanitizeString(input.guide?.name, 120),
      bio: {
        en: sanitizeString(input.guide?.bio?.en, 3000),
        ar: sanitizeString(input.guide?.bio?.ar, 3000)
      },
      languages: Array.isArray(input.guide?.languages) ? input.guide.languages.map((l) => sanitizeString(l, 40)).filter(Boolean) : [],
      specialties: Array.isArray(input.guide?.specialties) ? input.guide.specialties.map((s) => sanitizeString(s, 60)).filter(Boolean) : [],
      photoUrl: input.guide?.photoUrl ? sanitizeString(input.guide.photoUrl, 500) : null
    },
    social: {
      instagram: sanitizeString(input.social?.instagram, 300),
      facebook: sanitizeString(input.social?.facebook, 300),
      tiktok: sanitizeString(input.social?.tiktok, 300)
    },
    currency: {
      default: sanitizeString(input.currency?.default, 6) || 'EGP'
    },
    seo: {
      title: {
        en: sanitizeString(input.seo?.title?.en, 160),
        ar: sanitizeString(input.seo?.title?.ar, 160)
      },
      description: {
        en: sanitizeString(input.seo?.description?.en, 300),
        ar: sanitizeString(input.seo?.description?.ar, 300)
      }
    },
    updatedAt: now
  };

  await docRef.set(payload, { merge: true });
  return getSettings();
}