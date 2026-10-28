import { db } from './firestore.js';
import { getFirebaseAdmin } from '../config/firebase.js';
import { ValidationError, sanitizeString } from '../middleware/validate.js';

const COLLECTION = 'gallery';

function mapGallery(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    publicId: data.publicId || '',
    secureUrl: data.secureUrl || '',
    width: data.width || null,
    height: data.height || null,
    format: data.format || '',
    bytes: data.bytes || null,
    alt: data.alt || { en: '', ar: '' },
    caption: data.caption || { en: '', ar: '' },
    displayOrder: data.displayOrder || 0,
    visibility: data.visibility || 'public',
    tourId: data.tourId || null,
    createdAt: data.createdAt?.toDate?.() || null
  };
}

export async function listPublicGallery({ limit = 24 } = {}) {
  const snapshot = await db().collection(COLLECTION)
    .where('visibility', '==', 'public')
    .orderBy('displayOrder', 'asc')
    .limit(limit)
    .get();
  return snapshot.docs.map(mapGallery);
}

export async function adminListGallery() {
  const snapshot = await db().collection(COLLECTION).orderBy('displayOrder', 'asc').get();
  return snapshot.docs.map(mapGallery);
}

export async function adminRegisterImage(payload) {
  const secureUrl = sanitizeString(payload.secureUrl, 500);
  const publicId = sanitizeString(payload.publicId, 300);
  if (!secureUrl || !publicId) {
    throw new ValidationError({ secureUrl: 'Image URL and public ID are required.' });
  }
  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();
  const ref = db().collection(COLLECTION).doc();
  await ref.set({
    publicId,
    secureUrl,
    width: Number(payload.width) || null,
    height: Number(payload.height) || null,
    format: sanitizeString(payload.format, 10),
    bytes: Number(payload.bytes) || null,
    alt: {
      en: sanitizeString(payload.altEn, 300),
      ar: sanitizeString(payload.altAr, 300)
    },
    caption: {
      en: sanitizeString(payload.captionEn, 300),
      ar: sanitizeString(payload.captionAr, 300)
    },
    displayOrder: Number(payload.displayOrder) || 0,
    visibility: payload.visibility === 'hidden' ? 'hidden' : 'public',
    tourId: payload.tourId ? sanitizeString(payload.tourId, 100) : null,
    createdAt: now
  });
  return mapGallery(await ref.get());
}

export async function adminUpdateGalleryImage(id, payload) {
  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  await docRef.update({
    alt: {
      en: sanitizeString(payload.alt?.en, 300),
      ar: sanitizeString(payload.alt?.ar, 300)
    },
    caption: {
      en: sanitizeString(payload.caption?.en, 300),
      ar: sanitizeString(payload.caption?.ar, 300)
    },
    displayOrder: Number(payload.displayOrder) || 0,
    visibility: payload.visibility === 'hidden' ? 'hidden' : 'public'
  });
  return mapGallery(await docRef.get());
}

export async function adminDeleteGalleryImage(id) {
  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  const data = doc.data();
  await docRef.delete();
  return { id, publicId: data.publicId || '' };
}