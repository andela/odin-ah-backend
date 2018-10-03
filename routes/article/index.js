import { Router } from 'express';
import articles from './router';

const router = Router();

router.use('/articles', articles);

export default router;
