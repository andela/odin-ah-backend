import { Router } from 'express';
import PageValidator from '../../middlewares/validators/PageValidator';
import ArticleController from '../../controllers/article/ArticleController';
import SeriesController from '../../controllers/series/SeriesController';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';

const router = Router();

router.get('/series', PageValidator.validate, asyncCatchErrors(SeriesController.getAuthUserMultipleSeries));
router.get('/articles', PageValidator.validate, asyncCatchErrors(ArticleController.getAuthUserArticles));

export default router;
