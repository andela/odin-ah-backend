import { Router } from 'express';
import comments from './router';

const router = Router();

router.use('/:slug/comments', (req, res, next) => {
  const { slug } = req.params;
  req.slug = slug;
  next();
}, comments);

export default router;
