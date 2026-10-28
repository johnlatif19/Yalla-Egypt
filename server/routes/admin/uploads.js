import express from 'express';
import { createUploadSignature } from '../../services/cloudinary.js';
import { adminRegisterImage } from '../../services/gallery.js';
import { verifyIdToken, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.use(verifyIdToken, requireAdmin);

router.post('/sign', async (req, res, next) => {
  try {
    const signature = createUploadSignature({
      folder: req.body?.folder,
      publicId: req.body?.publicId
    });
    res.json(signature);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const result = await adminRegisterImage(req.body || {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;