import { Router } from 'express';
import shareByEmail from './router';

const router = Router();

router.use(
  '/:slug/mailto',
  (req, res, next) => {
    const { slug } = req.params;
    req.slug = slug;
    next();
  },
  shareByEmail
);

export default router;
