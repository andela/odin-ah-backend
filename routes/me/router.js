import { Router } from 'express';

import ArticleController from '../../controllers/article/ArticleController';
import PageValidator from '../../middlewares/validators/PageValidator';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';

const router = Router();

router.get('/articles', PageValidator.validate, asyncCatchErrors(ArticleController.getAuthUserArticles));

export default router;
