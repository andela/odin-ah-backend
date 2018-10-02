import { Router } from 'express';

import ArticleValidator from '../../middlewares/validators/ArticleValidator';
import ArticleController from '../../controllers/article/ArticleController';
import PageValidator from '../../middlewares/validators/PageValidator';

const router = Router();

router.put('/:slug', ArticleValidator.updateArticleValidator, ArticleController.updateArticles);

router.get('/:slug', ArticleController.getArticle);

router.delete('/:slug', ArticleController.deleteArticle);

router.post('/', ArticleValidator.createArticleValidator, ArticleController.createArticle);

router.get('/', PageValidator.validate, ArticleController.getArticles);

export default router;
