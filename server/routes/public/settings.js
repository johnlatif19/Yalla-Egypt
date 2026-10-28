import express from 'express';
import { getSettings, getPublicSettings } from '../../services/settings.js';
import { publicLimiter } from '../../middleware/rateLimit.js';

const router = express.Router();

router.get('/', publicLimiter, async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(getPublicSettings(settings));
  } catch (error) {
    next(error);
  }
});

export default router;