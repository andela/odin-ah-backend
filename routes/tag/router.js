import { Router } from 'express';
import TagController from '../../controllers/article/TagController';
import PageValidator from '../../middlewares/validators/PageValidator';
import HttpError from '../../helpers/exceptionHandler/httpError';

const router = Router();

router.get('/popular', (TagController.getPopularTags));
router.get('/', PageValidator.validate, (req, res, next) => {
  const { filter } = req.query;

  if (typeof filter !== 'undefined' && filter.trim().length === 0) {
    return next(new HttpError('filter cannot be empty', 400));
  }
  next();
}, (TagController.getTags));

export default router;
