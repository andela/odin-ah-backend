import { Router } from 'express';
import sentiment from './router';

const router = Router();

router.use('/sentiment-analyzer', sentiment);

export default router;
