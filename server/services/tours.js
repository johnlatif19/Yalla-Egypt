import { db, timestamp } from './firestore.js';
import { getFirebaseAdmin } from '../config/firebase.js';
import { toSlug, pickLocalized, sanitizeString, ValidationError } from '../middleware/validate.js';

const COLLECTION = 'tours';

function mapDoc(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    slug: data.slug || '',
    title: data.title || { en: '', ar: '' },
    shortDescription: data.shortDescription || { en: '', ar: '' },
    description: data.description || { en: '', ar: '' },
    coverImage: data.coverImage || null,
    gallery: Array.isArray(data.gallery) ? data.gallery : [],
    duration: data.duration || '',
    location: data.location || '',
    category: data.category || '',
    price: data.price ?? null,
    currency: data.currency || '',
    included: data.included || [],
    excluded: data.excluded || [],
    itinerary: data.itinerary || [],
    meetingPoint: data.meetingPoint || '',
    availabilityNotes: data.availabilityNotes || '',
    cancellationPolicy: data.cancellationPolicy || '',
    faq: data.faq || [],
    published: data.published === true,
    featured: data.featured === true,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null
  };
}

export async function listPublishedTours({ page = 1, pageSize = 12, search = '', category = '', duration = '', sort = 'newest', featured } = {}) {
  let query = db().collection(COLLECTION).where('published', '==', true);

  if (featured === true) {
    query = query.where('featured', '==', true);
  }

  if (category) {
    query = query.where('category', '==', category);
  }

  if (duration) {
    query = query.where('duration', '==', duration);
  }

  if (sort === 'price-low') {
    query = query.orderBy('price', 'asc');
  } else if (sort === 'price-high') {
    query = query.orderBy('price', 'desc');
  } else if (sort === 'title') {
    query = query.orderBy('title.en', 'asc');
  } else {
    query = query.orderBy('createdAt', 'desc');
  }

  const snapshot = await query.get();
  let items = snapshot.docs.map(mapDoc);

  if (search) {
    const term = search.toLowerCase();
    items = items.filter((item) =>
      item.title.en.toLowerCase().includes(term) ||
      item.title.ar.toLowerCase().includes(term) ||
      item.slug.toLowerCase().includes(term)
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, page, pageSize };
}

export async function getTourBySlug(slug) {
  const safeSlug = toSlug(slug);
  if (!safeSlug) return null;
  const snapshot = await db().collection(COLLECTION).where('slug', '==', safeSlug).where('published', '==', true).limit(1).get();
  if (snapshot.empty) return null;
  return mapDoc(snapshot.docs[0]);
}

export async function adminListTours({ page = 1, pageSize = 20, search = '', published } = {}) {
  let query = db().collection(COLLECTION);

  if (published === true || published === false) {
    query = query.where('published', '==', published);
  }

  query = query.orderBy('updatedAt', 'desc');

  const snapshot = await query.get();
  let items = snapshot.docs.map(mapDoc);

  if (search) {
    const term = search.toLowerCase();
    items = items.filter((item) =>
      item.title.en.toLowerCase().includes(term) ||
      item.title.ar.toLowerCase().includes(term) ||
      item.slug.toLowerCase().includes(term)
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;

  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

export async function adminGetTour(id) {
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return mapDoc(doc);
}

function buildTourPayload(input) {
  const title = pickLocalized(input.title, 160);
  if (!title.en && !title.ar) {
    throw new ValidationError({ title: 'Title is required in at least one language.' });
  }

  const slug = toSlug(input.slug || title.en);
  if (!slug) {
    throw new ValidationError({ slug: 'A valid slug is required.' });
  }

  return {
    slug,
    title,
    shortDescription: pickLocalized(input.shortDescription, 500),
    description: pickLocalized(input.description, 5000),
    coverImage: input.coverImage || null,
    gallery: Array.isArray(input.gallery) ? input.gallery : [],
    duration: sanitizeString(input.duration, 60),
    location: sanitizeString(input.location, 120),
    category: sanitizeString(input.category, 60),
    price: input.price != null && !Number.isNaN(Number(input.price)) ? Number(input.price) : null,
    currency: sanitizeString(input.currency, 6),
    included: Array.isArray(input.included) ? input.included : [],
    excluded: Array.isArray(input.excluded) ? input.excluded : [],
    itinerary: Array.isArray(input.itinerary) ? input.itinerary : [],
    meetingPoint: sanitizeString(input.meetingPoint, 500),
    availabilityNotes: sanitizeString(input.availabilityNotes, 500),
    cancellationPolicy: sanitizeString(input.cancellationPolicy, 1000),
    faq: Array.isArray(input.faq) ? input.faq : [],
    published: input.published === true,
    featured: input.featured === true
  };
}

export async function adminCreateTour(input, actor) {
  const payload = buildTourPayload(input);
  const existing = await db().collection(COLLECTION).where('slug', '==', payload.slug).limit(1).get();
  if (!existing.empty) {
    throw new ValidationError({ slug: 'A tour with this slug already exists.' });
  }
  const ref = db().collection(COLLECTION).doc();
  const { getFirebaseAdmin } = { getFirebaseAdmin: () => null };
  const now = (await import('../config/firebase.js')).getFirebaseAdmin().firestore.FieldValue.serverTimestamp();
  await ref.set({
    ...payload,
    createdAt: now,
    updatedAt: now,
    createdBy: actor?.uid || null
  });
  return { id: ref.id };
}

export async function adminUpdateTour(id, input, actor) {
  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const payload = buildTourPayload(input);
  const slugConflict = await db().collection(COLLECTION).where('slug', '==', payload.slug).limit(2).get();
  const conflict = slugConflict.docs.find((d) => d.id !== id);
  if (conflict) {
    throw new ValidationError({ slug: 'A tour with this slug already exists.' });
  }

  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();

  await docRef.update({
    ...payload,
    updatedAt: now,
    updatedBy: actor?.uid || null
  });

  return { id };
}

export async function adminDeleteTour(id) {
  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;
  await docRef.delete();
  return true;
}