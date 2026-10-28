import express from 'express';
import { listPublicGallery } from '../../services/gallery.js';
import { publicLimiter } from '../../middleware/rateLimit.js';

const router = express.Router();

router.get('/', publicLimiter, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 100);
    const items = await listPublicGallery({ limit });
    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
});

export default router;