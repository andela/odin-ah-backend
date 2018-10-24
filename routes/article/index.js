import { Router } from 'express';
import articles from './router';
import comment from '../comment';
import share from '../sharing';

const router = Router();

router.use('/articles', articles, comment, share);

export default router;
