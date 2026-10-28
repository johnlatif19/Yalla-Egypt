import express from 'express';
import { db } from '../../services/firestore.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const toursRef = db().collection('tours');
    const bookingsRef = db().collection('bookings');

    const [
      totalToursSnap,
      publishedToursSnap,
      pendingBookingsSnap,
      confirmedBookingsSnap
    ] = await Promise.all([
      toursRef.count().get(),
      toursRef.where('published', '==', true).count().get(),
      bookingsRef.where('status', '==', 'pending').count().get(),
      bookingsRef.where('status', '==', 'confirmed').count().get()
    ]);

    res.json({
      totalTours: totalToursSnap.data().count,
      publishedTours: publishedToursSnap.data().count,
      pendingBookings: pendingBookingsSnap.data().count,
      confirmedBookings: confirmedBookingsSnap.data().count
    });
  } catch (error) {
    next(error);
  }
});

export default router;