function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback = '') {
  return process.env[name] || fallback;
}

function normalizePrivateKey(raw) {
  if (!raw) return '';
  return raw.replace(/\\n/g, '\n');
}

const nodeEnv = optional('NODE_ENV', 'development');

export const env = {
  NODE_ENV: nodeEnv,
  isProduction: nodeEnv === 'production',
  PORT: Number(optional('PORT', '3001')),
  APP_BASE_URL: optional('APP_BASE_URL', 'http://localhost:3000'),

  FIREBASE_PROJECT_ID: required('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: required('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: normalizePrivateKey(required('FIREBASE_PRIVATE_KEY')),

  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET'),
  CLOUDINARY_UPLOAD_FOLDER: optional('CLOUDINARY_UPLOAD_FOLDER', 'yalla-egypt'),

  RATE_LIMIT_WINDOW_MS: Number(optional('RATE_LIMIT_WINDOW_MS', '60000')),
  RATE_LIMIT_MAX: Number(optional('RATE_LIMIT_MAX', '30'))
};

export function assertCloudinaryConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }
}