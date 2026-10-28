import express from 'express';
import {
  adminListGallery,
  adminUpdateGalleryImage,
  adminDeleteGalleryImage
} from '../../services/gallery.js';
import { destroyCloudinaryAsset } from '../../services/cloudinary.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const items = await adminListGallery();
    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const result = await adminUpdateGalleryImage(req.params.id, req.body || {});
    if (!result) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Image not found.' }
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await adminDeleteGalleryImage(req.params.id);
    if (!result) {
      return res.status(404).json({
        error: { code: 'not_found', message: 'Image not found.' }
      });
    }

    if (result.publicId) {
      try {
        await destroyCloudinaryAsset(result.publicId);
      } catch {
        // Cloudinary deletion failure does not block the DB deletion
      }
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;