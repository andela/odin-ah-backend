import { Router } from 'express';
import SentimentController from '../../controllers/article/SentimentController';

const router = Router();

router.post('/', SentimentController.analyse);

export default router;
