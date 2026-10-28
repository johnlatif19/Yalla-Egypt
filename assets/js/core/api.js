import { config } from './config.js';

class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildUrl(path, query) {
  const base = config.apiBase.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${cleanPath}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return null;
}

async function request(path, options = {}) {
  const { method = 'GET', body, query, headers = {}, signal, auth = false } = options;

  const finalHeaders = {
    Accept: 'application/json',
    ...headers
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAuthToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: 'same-origin'
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Network request failed', 0, 'network_error');
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const code = data?.error?.code || data?.code || 'request_failed';
    throw new ApiError(message, response.status, code, data?.error?.details || data?.details);
  }

  return data;
}

async function getAuthToken() {
  try {
    const { getCurrentUserToken } = await import('./auth.js');
    return await getCurrentUserToken();
  } catch {
    return null;
  }
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' })
};

export { ApiError };

export function getTours(query) {
  return api.get('/tours', { query });
}

export function getTourBySlug(slug) {
  return api.get(`/tours/${encodeURIComponent(slug)}`);
}

export function getGallery(query) {
  return api.get('/gallery', { query });
}

export function getSettings() {
  return api.get('/settings');
}

export function createBooking(payload, options = {}) {
  return api.post('/bookings', payload, options);
}

export function getBookingByReference(reference) {
  return api.get(`/bookings/reference/${encodeURIComponent(reference)}`);
}

export function sendContactMessage(payload) {
  return api.post('/contact', payload);
}

export function adminGetStats() {
  return api.get('/admin/stats', { auth: true });
}

export function adminGetTours(query) {
  return api.get('/admin/tours', { query, auth: true });
}

export function adminGetTour(id) {
  return api.get(`/admin/tours/${encodeURIComponent(id)}`, { auth: true });
}

export function adminCreateTour(payload) {
  return api.post('/admin/tours', payload, { auth: true });
}

export function adminUpdateTour(id, payload) {
  return api.put(`/admin/tours/${encodeURIComponent(id)}`, payload, { auth: true });
}

export function adminDeleteTour(id) {
  return api.delete(`/admin/tours/${encodeURIComponent(id)}`, { auth: true });
}

export function adminGetBookings(query) {
  return api.get('/admin/bookings', { query, auth: true });
}

export function adminGetBooking(id) {
  return api.get(`/admin/bookings/${encodeURIComponent(id)}`, { auth: true });
}

export function adminUpdateBookingStatus(id, status, note) {
  return api.patch(
    `/admin/bookings/${encodeURIComponent(id)}/status`,
    { status, note },
    { auth: true }
  );
}

export function adminAddBookingNote(id, note) {
  return api.post(`/admin/bookings/${encodeURIComponent(id)}/notes`, { note }, { auth: true });
}

export function adminGetGallery(query) {
  return api.get('/admin/gallery', { query, auth: true });
}

export function adminDeleteGalleryImage(id) {
  return api.delete(`/admin/gallery/${encodeURIComponent(id)}`, { auth: true });
}

export function adminUpdateGalleryImage(id, payload) {
  return api.patch(`/admin/gallery/${encodeURIComponent(id)}`, payload, { auth: true });
}

export function adminGetSettings() {
  return api.get('/admin/settings', { auth: true });
}

export function adminUpdateSettings(payload) {
  return api.put('/admin/settings', payload, { auth: true });
}

export async function adminUploadImage(file, options = {}) {
  const { getUploadSignature } = await import('./auth.js');
  const signature = await getUploadSignature(options);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);
  if (options.publicId) formData.append('public_id', options.publicId);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      data?.error?.message || 'Image upload failed',
      response.status,
      'upload_failed'
    );
  }

  const data = await response.json();

  return api.post(
    '/admin/uploads/register',
    {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
      altEn: options.altEn || '',
      altAr: options.altAr || '',
      captionEn: options.captionEn || '',
      captionAr: options.captionAr || '',
      tourId: options.tourId || null,
      displayOrder: options.displayOrder || 0,
      visibility: options.visibility || 'public'
    },
    { auth: true }
  );
}