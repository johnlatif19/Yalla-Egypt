import { config } from './config.js';

let firebaseApp = null;
let authInstance = null;
let authModule = null;
let authStateListeners = new Set();

async function loadFirebase() {
  if (authModule) return authModule;

  const [appMod, authMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js')
  ]);

  if (!config.firebase.apiKey || !config.firebase.projectId) {
    throw new Error('Firebase client configuration is missing.');
  }

  firebaseApp = appMod.initializeApp(config.firebase);
  authInstance = authMod.getAuth(firebaseApp);
  authModule = { app: firebaseApp, auth: authInstance, ...authMod };

  authMod.onAuthStateChanged(authInstance, (user) => {
    authStateListeners.forEach((listener) => {
      try {
        listener(user);
      } catch {
        // ignore listener errors
      }
    });
  });

  return authModule;
}

export async function initAuth() {
  return loadFirebase();
}

export async function signIn(email, password) {
  const { signInWithEmailAndPassword } = await loadFirebase();
  const credential = await signInWithEmailAndPassword(authInstance, email, password);
  return credential.user;
}

export async function signOut() {
  const { signOut: fbSignOut } = await loadFirebase();
  await fbSignOut(authInstance);
}

export function onAuthChange(callback) {
  authStateListeners.add(callback);
  if (authInstance) {
    callback(authInstance.currentUser);
  }
  return () => authStateListeners.delete(callback);
}

export async function getCurrentUser() {
  if (!authInstance) {
    try {
      await loadFirebase();
    } catch {
      return null;
    }
  }
  return authInstance?.currentUser || null;
}

export async function getCurrentUserToken(forceRefresh = false) {
  const user = await getCurrentUser();
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  try {
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.replace('/login');
    return null;
  }
  const admin = await isAdmin();
  if (!admin) {
    await signOut();
    window.location.replace('/login');
    return null;
  }
  return user;
}

export async function getUploadSignature(options = {}) {
  const { api } = await import('./api.js');
  return api.post('/admin/uploads/sign', options, { auth: true });
}

export async function getIdTokenForApi() {
  return getCurrentUserToken();
}