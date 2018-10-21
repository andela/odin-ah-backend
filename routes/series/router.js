import { Router } from 'express';

import SeriesValidator from '../../middlewares/validators/SeriesValidator';
import SeriesController from '../../controllers/series/SeriesController';
import FollowSeriesController from '../../controllers/series/FollowSeriesController';
import PageValidator from '../../middlewares/validators/PageValidator';
import ArticleValidator from '../../middlewares/validators/ArticleValidator';

const router = Router();

router.put('/:slug', SeriesValidator.updateSeriesValidator, SeriesController.updateSeries);

router.get('/:slug', PageValidator.validate, SeriesController.getSingleSeries);

router.post('/:slug/:follow', SeriesValidator.followParams, FollowSeriesController.followSeries);

router.post('/', SeriesValidator.createSeriesValidator, SeriesController.createSeries);

router.post('/:slug/add/articles', ArticleValidator.createArticleValidator, SeriesController.addArticlesToSeries);

router.get('/', PageValidator.validate, SeriesController.getMultipleSeries);

router.delete('/:slug', (req, res, next) => {
  const { deleteContents } = req.body;
  if (typeof deleteContents !== 'boolean') {
    return res.status(400)
      .json({
        message: 'deleteContents must be a boolean',
        status: 'error',
      });
  }
  return next();
}, SeriesController.deleteSeries);

export default router;
