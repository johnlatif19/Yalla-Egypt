import express from 'express';
import { createBooking, getBookingByReference } from '../../services/bookings.js';
import { bookingLimiter } from '../../middleware/rateLimit.js';

const router = express.Router();

router.post('/', bookingLimiter, async (req, res, next) => {
  try {
    const result = await createBooking(req.body || {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/reference/:reference', bookingLimiter, async (req, res, next) => {
  try {
    const booking = await getBookingByReference(req.params.reference);
    if (!booking) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Booking not found.' }
      });
    }

    res.json({
      reference: booking.reference,
      tour: booking.tour,
      requestedDate: booking.requestedDate,
      party: booking.party,
      status: booking.status
    });
  } catch (error) {
    next(error);
  }
});

export default router;