import { Router } from 'express';
import report from './router';

const router = Router();

router.use('/report/', report);

export default router;
