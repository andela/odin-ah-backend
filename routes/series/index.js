import { Router } from 'express';
import series from './router';

const router = Router();

router.use('/series', series);

export default router;
