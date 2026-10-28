import express from 'express';
import { listPublishedTours, getTourBySlug } from '../../services/tours.js';
import { publicLimiter } from '../../middleware/rateLimit.js';

const router = express.Router();

router.get('/', publicLimiter, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 12, 1), 50);
    const featured = req.query.featured === 'true' ? true : undefined;

    const result = await listPublishedTours({
      page,
      pageSize,
      search: req.query.search || '',
      category: req.query.category || '',
      duration: req.query.duration || '',
      sort: req.query.sort || 'newest',
      featured
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', publicLimiter, async (req, res, next) => {
  try {
    const tour = await getTourBySlug(req.params.slug);
    if (!tour) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Tour not found.' }
      });
    }
    res.json(tour);
  } catch (error) {
    next(error);
  }
});

export default router;