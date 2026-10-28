import express from 'express';
import {
  adminListBookings,
  adminGetBooking,
  adminUpdateBookingStatus,
  adminAddBookingNote
} from '../../services/bookings.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);

    const result = await adminListBookings({
      page,
      pageSize,
      search: req.query.search || '',
      status: req.query.status || '',
      ref: req.query.ref || ''
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await adminGetBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Booking not found.' }
      });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const result = await adminUpdateBookingStatus(
      req.params.id,
      req.body?.status,
      req.body?.note
    );
    if (!result) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Booking not found.' }
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/notes', async (req, res, next) => {
  try {
    const result = await adminAddBookingNote(req.params.id, req.body?.note, req.user);
    if (!result) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Booking not found.' }
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;