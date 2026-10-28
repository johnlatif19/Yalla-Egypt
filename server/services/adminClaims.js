import { getAuth } from '../config/firebase.js';

export async function grantAdminClaim(uid) {
  await getAuth().setCustomUserClaims(uid, { admin: true });
  return { uid, admin: true };
}

export async function revokeAdminClaim(uid) {
  await getAuth().setCustomUserClaims(uid, { admin: false });
  return { uid, admin: false };
}

export async function getUserByEmail(email) {
  try {
    return await getAuth().getUserByEmail(email);
  } catch {
    return null;
  }
}