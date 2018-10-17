import { Router } from 'express';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';
import LikesController from '../../controllers/article/LikesController';
import LikeValidator from '../../middlewares/validators/LikeValidator';

const router = Router();

router.post('/likes/:slug/:status', LikeValidator.addLikeValidator, asyncCatchErrors(LikesController.addLike));


export default router;
