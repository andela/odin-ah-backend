import { Router } from 'express';
import Bookmark from './router';

const router = Router();

router.use('/report/', Bookmark);

export default router;
