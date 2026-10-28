import express from 'express';
import {
  adminListTours,
  adminGetTour,
  adminCreateTour,
  adminUpdateTour,
  adminDeleteTour
} from '../../services/tours.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
    const publishedParam = req.query.published;
    const published = publishedParam === 'true' ? true : publishedParam === 'false' ? false : undefined;

    const result = await adminListTours({
      page,
      pageSize,
      search: req.query.search || '',
      published
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tour = await adminGetTour(req.params.id);
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

router.post('/', async (req, res, next) => {
  try {
    const result = await adminCreateTour(req.body || {}, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await adminUpdateTour(req.params.id, req.body || {}, req.user);
    if (!result) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Tour not found.' }
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await adminDeleteTour(req.params.id);
    if (!ok) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Tour not found.' }
      });
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;