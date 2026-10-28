import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

export function applySecurity(app) {
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  const allowedOrigins = [
    env.APP_BASE_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (env.NODE_ENV !== 'production') return callback(null, true);
      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true
  }));
}