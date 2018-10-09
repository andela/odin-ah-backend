import { Router } from 'express';
import likeType from './router';

const router = Router();

router.use('/articles', likeType);

export default router;
