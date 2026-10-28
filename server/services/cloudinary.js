import crypto from 'node:crypto';
import { env, assertCloudinaryConfigured } from '../config/env.js';

export function createUploadSignature({ folder, publicId } = {}) {
  assertCloudinaryConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const targetFolder = folder || env.CLOUDINARY_UPLOAD_FOLDER;

  const paramsToSign = {
    timestamp,
    folder: targetFolder
  };

  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(`${sorted}${env.CLOUDINARY_API_SECRET}`)
    .digest('hex');

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    folder: targetFolder,
    signature,
    publicId: publicId || null
  };
}

export async function destroyCloudinaryAsset(publicId) {
  if (!publicId) return { result: 'skipped' };
  assertCloudinaryConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`)
    .digest('hex');

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: env.CLOUDINARY_API_KEY,
    signature
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
    { method: 'POST', body }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || 'Cloudinary deletion failed');
  }

  return response.json();
}