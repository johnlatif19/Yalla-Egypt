import { getAuth } from '../config/firebase.js';

export async function verifyIdToken(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Missing authentication token.' }
    });
  }

  try {
    const decoded = await getAuth().verifyIdToken(match[1], true);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      admin: decoded.admin === true
    };
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'unauthorized', message: 'Invalid or expired authentication token.' }
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({
      error: { code: 'forbidden', message: 'Administrator access is required.' }
    });
  }
  next();
}

export function requireAdminChain() {
  return [verifyIdToken, requireAdmin];
}