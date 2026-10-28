import { getFirestore } from '../config/firebase.js';

export function db() {
  return getFirestore();
}

export const FieldValue = {
  serverTimestamp: () => {
    const { getFirebaseAdmin } = requireAdminSdk();
    return getFirebaseAdmin().firestore.FieldValue.serverTimestamp();
  }
};

function requireAdminSdk() {
  return {
    getFirebaseAdmin: () => {
      const mod = globalThis.__firebaseAdminModule__;
      if (mod) return mod;
      throw new Error('Firebase Admin module not loaded');
    }
  };
}

export function timestamp() {
  const { getFirebaseAdmin } = globalThis.__firebaseAdminLoader__();
  return getFirebaseAdmin().firestore.FieldValue.serverTimestamp();
}