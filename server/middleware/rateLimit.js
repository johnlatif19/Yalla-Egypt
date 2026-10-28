import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const limiterOptions = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false }
};

export const publicLimiter = rateLimit({
  ...limiterOptions,
  message: {
    error: { code: 'rate_limited', message: 'Too many requests. Please try again later.' }
  }
});

export const bookingLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: { code: 'rate_limited', message: 'Too many booking attempts. Please try again later.' }
  }
});

export const contactLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: { code: 'rate_limited', message: 'Too many messages. Please try again later.' }
  }
});
