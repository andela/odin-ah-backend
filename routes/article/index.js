import { Router } from 'express';
import articles from './router';
import comment from '../comment';

const router = Router();

router.use('/articles', articles, comment);

export default router;
