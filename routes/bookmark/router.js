import { Router } from 'express';
import BookmarkController from '../../controllers/bookmark/BookmarkController';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';
import PageValidator from '../../middlewares/validators/PageValidator';

const router = Router();

router.post('/articles/:slug', asyncCatchErrors(BookmarkController.addBookmark));
router.delete('/articles/:slug', asyncCatchErrors(BookmarkController.removeBookmark));
router.get('/articles', PageValidator.validate, asyncCatchErrors(BookmarkController.getAllBookmarkedArticle));

export default router;
