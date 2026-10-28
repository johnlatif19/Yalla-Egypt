export class ValidationError extends Error {
  constructor(details) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'validation_error';
    this.details = details;
  }
}

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema(req.body || {});
    if (!result.ok) {
      return res.status(400).json({
        error: { code: 'validation_error', message: 'Please check the fields and try again.', details: result.errors }
      });
    }
    req.validatedBody = result.value;
    next();
  };
}

export function sanitizeString(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

export function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPhone(value) {
  if (typeof value !== 'string') return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 20;
}

export function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function isFutureOrToday(value) {
  if (!isIsoDate(value)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  return date >= today;
}

export function toSlug(value) {
  return sanitizeString(value, 120)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function pickLocalized(value, maxLength = 3000) {
  if (!value || typeof value !== 'object') return { en: '', ar: '' };
  return {
    en: sanitizeString(value.en, maxLength),
    ar: sanitizeString(value.ar, maxLength)
  };
}