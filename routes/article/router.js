import { Router } from 'express';

import ArticleValidator from '../../middlewares/validators/ArticleValidator';
import ArticleController from '../../controllers/article/ArticleController';
import PageValidator from '../../middlewares/validators/PageValidator';
import Guard from '../../middlewares/Guard';
import Roles from '../../config/role/index';
import HttpError from '../../helpers/exceptionHandler/httpError';
import Util from '../../helpers/Util';

const router = Router();

router.put('/:slug/disable', Guard.allow(Roles.admin), ArticleController.disableArticle);

router.put('/:slug', ArticleValidator.updateArticleValidator, ArticleController.updateArticles);

router.get('/:slug', ArticleController.getArticle);

router.delete('/:slug', ArticleController.deleteArticle);

router.post('/', ArticleValidator.createArticleValidator, ArticleController.createArticle);

router.get('/', PageValidator.validate, (req, res, next) => {
  const { tag } = req.query;
  const message = Util.validateTag(tag);
  if (message) {
    return next(new HttpError(message, 400));
  }
  next();
}, ArticleController.getArticles);


export default router;
