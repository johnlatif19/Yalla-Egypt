const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateBookingReference() {
  let ref = 'YE-';
  for (let i = 0; i < 6; i += 1) {
    ref += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return ref;
}

export function isValidBookingReference(value) {
  if (typeof value !== 'string') return false;
  return /^YE-[A-HJ-NP-Z2-9]{6}$/.test(value.trim().toUpperCase());
}