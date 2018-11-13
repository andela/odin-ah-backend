import { Router } from 'express';
import tag from './router';

const router = Router();

router.use('/tags', tag);

export default router;
