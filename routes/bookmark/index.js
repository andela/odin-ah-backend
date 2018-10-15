import { Router } from 'express';
import Bookmark from './router';

const router = Router();

router.use('/bookmark/', Bookmark);

export default router;
