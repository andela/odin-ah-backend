import { Router } from 'express';
import me from './router';

const router = Router();

router.use('/me', me);

export default router;
