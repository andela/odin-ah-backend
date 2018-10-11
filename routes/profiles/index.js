import { Router } from 'express';
import profiles from './profiles';

const router = Router();

router.use('/profiles', profiles);

export default router;
