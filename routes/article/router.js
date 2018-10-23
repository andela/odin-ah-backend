import { Router } from 'express';

import ArticleValidator from '../../middlewares/validators/ArticleValidator';
import ArticleController from '../../controllers/article/ArticleController';
import PageValidator from '../../middlewares/validators/PageValidator';
import Guard from '../../middlewares/Guard';
import Roles from '../../config/role/index';
import Authorization from '../../middlewares/Authorization';

const router = Router();

router.put('/:slug/disable', Guard.allow(Roles.admin), ArticleController.disableArticle);

router.put('/:slug', ArticleValidator.updateArticleValidator, ArticleController.updateArticles);

router.get('/:slug', Authorization.passAuthUser, ArticleController.getArticle);

router.delete('/:slug', ArticleController.deleteArticle);

router.post('/', ArticleValidator.createArticleValidator, ArticleController.createArticle);

router.get('/', PageValidator.validate, ArticleController.getArticles);


export default router;
