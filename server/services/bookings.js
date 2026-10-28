import { db } from './firestore.js';
import { generateBookingReference } from './bookingRef.js';
import {
  ValidationError,
  sanitizeString,
  isEmail,
  isPhone,
  isFutureOrToday,
  toSlug
} from '../middleware/validate.js';

const COLLECTION = 'bookings';

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  rejected: [],
  cancelled: [],
  completed: []
};

function mapBooking(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    reference: data.reference || '',
    tourId: data.tourId || '',
    tour: data.tour || null,
    visitor: data.visitor || {},
    party: data.party || { adults: 1, children: 0 },
    requestedDate: data.requestedDate || '',
    status: data.status || 'pending',
    adminNotes: Array.isArray(data.adminNotes) ? data.adminNotes : [],
    statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    consent: data.consent === true,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null
  };
}

function buildBookingPayload(input, tour) {
  const errors = {};

  const name = sanitizeString(input.name, 120);
  const email = sanitizeString(input.email, 180);
  const phone = sanitizeString(input.phone, 32);
  const date = sanitizeString(input.date, 10);

  if (!name) errors.name = 'Name is required.';
  if (!isEmail(email)) errors.email = 'A valid email is required.';
  if (!isPhone(phone)) errors.phone = 'A valid phone number is required.';
  if (!isFutureOrToday(date)) errors.date = 'A valid future date is required.';
  if (input.consent !== true) errors.consent = 'Consent is required.';

  const adults = Number(input.adults);
  if (!Number.isInteger(adults) || adults < 1 || adults > 30) {
    errors.adults = 'Adults must be between 1 and 30.';
  }

  const children = Number(input.children || 0);
  if (!Number.isInteger(children) || children < 0 || children > 20) {
    errors.children = 'Children must be between 0 and 20.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return {
    visitor: {
      name,
      email,
      phone,
      contactMethod: sanitizeString(input.contactMethod || 'email', 20),
      language: sanitizeString(input.language || 'en', 5),
      pickup: sanitizeString(input.pickup, 180),
      notes: sanitizeString(input.notes, 1000)
    },
    party: { adults, children },
    requestedDate: date,
    tourId: tour.id,
    tour: {
      slug: tour.slug,
      title: tour.title,
      duration: tour.duration,
      price: tour.price,
      currency: tour.currency
    },
    consent: true
  };
}

async function findPublishedTourBySlug(slug) {
  const safeSlug = toSlug(slug);
  if (!safeSlug) return null;

  const snapshot = await db()
    .collection('tours')
    .where('slug', '==', safeSlug)
    .where('published', '==', true)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    slug: data.slug,
    title: data.title,
    duration: data.duration,
    price: data.price,
    currency: data.currency
  };
}

async function findDuplicateBooking({ tourId, email, date }) {
  const snapshot = await db()
    .collection(COLLECTION)
    .where('tourId', '==', tourId)
    .where('visitor.email', '==', email)
    .where('requestedDate', '==', date)
    .where('status', 'in', ['pending', 'confirmed'])
    .limit(1)
    .get();

  return !snapshot.empty;
}

export async function createBooking(input) {
  const slug = toSlug(input.tourSlug || '');
  if (!slug) {
    throw new ValidationError({ tour: 'A valid tour must be selected.' });
  }

  const tour = await findPublishedTourBySlug(slug);
  if (!tour) {
    throw new ValidationError({ tour: 'The selected tour is not available.' });
  }

  const payload = buildBookingPayload(input, tour);

  const duplicate = await findDuplicateBooking({
    tourId: tour.id,
    email: payload.visitor.email,
    date: payload.requestedDate
  });

  if (duplicate) {
    const err = new Error('A request for this tour and date already exists.');
    err.status = 409;
    err.code = 'duplicate_booking';
    throw err;
  }

  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();

  let reference = generateBookingReference();
  let ref = db().collection(COLLECTION).doc();
  let attempts = 0;

  while (attempts < 5) {
    const exists = await db()
      .collection(COLLECTION)
      .where('reference', '==', reference)
      .limit(1)
      .get();

    if (exists.empty) break;

    reference = generateBookingReference();
    attempts += 1;
  }

  await ref.set({
    ...payload,
    reference,
    status: 'pending',
    adminNotes: [],
    statusHistory: [{ status: 'pending', at: new Date().toISOString() }],
    createdAt: now,
    updatedAt: now
  });

  return {
    id: ref.id,
    reference,
    status: 'pending',
    tour: payload.tour,
    requestedDate: payload.requestedDate,
    party: payload.party
  };
}

export async function getBookingByReference(reference) {
  const safe = sanitizeString(reference, 20).toUpperCase();
  if (!safe) return null;

  const snapshot = await db()
    .collection(COLLECTION)
    .where('reference', '==', safe)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return mapBooking(snapshot.docs[0]);
}

export async function adminListBookings({ page = 1, pageSize = 20, search = '', status = '', ref = '' } = {}) {
  let query = db().collection(COLLECTION);

  if (status) {
    query = query.where('status', '==', status);
  }

  if (ref) {
    query = query.where('reference', '==', sanitizeString(ref, 20).toUpperCase());
  }

  query = query.orderBy('createdAt', 'desc');

  const snapshot = await query.get();
  let items = snapshot.docs.map(mapBooking);

  if (search) {
    const term = search.toLowerCase();
    items = items.filter((item) =>
      (item.reference || '').toLowerCase().includes(term) ||
      (item.visitor?.name || '').toLowerCase().includes(term) ||
      (item.visitor?.email || '').toLowerCase().includes(term)
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize
  };
}

export async function adminGetBooking(id) {
  const doc = await db().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return mapBooking(doc);
}

export async function adminUpdateBookingStatus(id, status, note) {
  const safeStatus = sanitizeString(status, 20);

  if (!['confirmed', 'rejected', 'cancelled', 'completed'].includes(safeStatus)) {
    throw new ValidationError({ status: 'Invalid status value.' });
  }

  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const data = doc.data();
  const current = data.status || 'pending';
  const allowed = VALID_TRANSITIONS[current] || [];

  if (!allowed.includes(safeStatus)) {
    throw new ValidationError({
      status: `Cannot transition from ${current} to ${safeStatus}.`
    });
  }

  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();

  const historyEntry = {
    status: safeStatus,
    at: new Date().toISOString(),
    note: sanitizeString(note, 500)
  };

  await docRef.update({
    status: safeStatus,
    statusHistory: [...(data.statusHistory || []), historyEntry],
    updatedAt: now
  });

  return { id, status: safeStatus };
}

export async function adminAddBookingNote(id, noteText, actor) {
  const text = sanitizeString(noteText, 1000);
  if (!text) {
    throw new ValidationError({ note: 'Note text is required.' });
  }

  const docRef = db().collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const data = doc.data();
  const { getFirebaseAdmin } = await import('../config/firebase.js');
  const now = getFirebaseAdmin().firestore.FieldValue.serverTimestamp();

  const note = {
    text,
    createdAt: new Date().toISOString(),
    by: actor?.email || 'admin'
  };

  await docRef.update({
    adminNotes: [...(data.adminNotes || []), note],
    updatedAt: now
  });

  return { id, note };
}