import express from 'express';
import { applySecurity } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import publicToursRouter from './routes/public/tours.js';
import publicBookingsRouter from './routes/public/bookings.js';
import publicGalleryRouter from './routes/public/gallery.js';
import publicSettingsRouter from './routes/public/settings.js';
import adminToursRouter from './routes/admin/tours.js';
import adminBookingsRouter from './routes/admin/bookings.js';
import adminGalleryRouter from './routes/admin/gallery.js';
import adminSettingsRouter from './routes/admin/settings.js';
import adminUploadsRouter from './routes/admin/uploads.js';
import adminStatsRouter from './routes/admin/stats.js';

const app = express();

// السطر ده بيحل مشكلة الـ IP في Vercel
app.set('trust proxy', 1);

applySecurity(app);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (req, res) => {
  res.json({
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    }
  });
});

app.use('/api/tours', publicToursRouter);
app.use('/api/bookings', publicBookingsRouter);
app.use('/api/gallery', publicGalleryRouter);
app.use('/api/settings', publicSettingsRouter);

app.use('/api/admin/tours', adminToursRouter);
app.use('/api/admin/bookings', adminBookingsRouter);
app.use('/api/admin/gallery', adminGalleryRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/uploads', adminUploadsRouter);
app.use('/api/admin/stats', adminStatsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
