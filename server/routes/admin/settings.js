import express from 'express';
import { getSettings, updateSettings } from '../../services/settings.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const settings = await updateSettings(req.body || {});
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;