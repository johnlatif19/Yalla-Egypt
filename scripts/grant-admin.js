import 'dotenv/config';
import admin from 'firebase-admin';
import { env } from '../server/config/env.js';

function initFirebase() {
  if (admin.apps.length) return;
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY
    })
  });
}

async function grantAdmin(uid) {
  initFirebase();
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  const user = await admin.auth().getUser(uid);
  console.log(`Admin access granted to: ${user.email || uid}`);
}

async function revokeAdmin(uid) {
  initFirebase();
  await admin.auth().setCustomUserClaims(uid, { admin: false });
  const user = await admin.auth().getUser(uid);
  console.log(`Admin access revoked from: ${user.email || uid}`);
}

async function findUserByEmail(email) {
  initFirebase();
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user.uid;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const flags = { revoke: false, email: null, uid: null };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--revoke') flags.revoke = true;
    else if (arg === '--email' && args[i + 1]) { flags.email = args[i + 1]; i += 1; }
    else if (arg === '--uid' && args[i + 1]) { flags.uid = args[i + 1]; i += 1; }
    else if (!arg.startsWith('--') && !flags.uid && !flags.email) flags.uid = arg;
  }

  let uid = flags.uid;
  if (flags.email) {
    uid = await findUserByEmail(flags.email);
    if (!uid) {
      console.error(`No user found with email: ${flags.email}`);
      process.exit(1);
    }
  }

  if (!uid) {
    console.error('Usage: node scripts/grant-admin.js <UID> | --email <email> | --uid <uid> [--revoke]');
    process.exit(1);
  }

  if (flags.revoke) {
    await revokeAdmin(uid);
  } else {
    await grantAdmin(uid);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});