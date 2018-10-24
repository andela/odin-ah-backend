import { Router } from 'express';
import ShareController from '../../controllers/article/ShareController';

const router = Router();

router.post('/', ShareController.validateInputs, ShareController.share);

export default router;
