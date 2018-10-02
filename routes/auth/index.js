import { Router } from 'express';
import cors from 'cors';
import auth from './auth';

const router = Router();

router.use('/auth', auth);
router.use(cors());

export default router;
