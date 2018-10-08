import { Router } from 'express';
import CommentController from '../../controllers/comment/CommentController';
import ArticleValidator from '../../middlewares/validators/ArticleValidator';

const router = Router();

router.delete('/:id', CommentController.deleteComment);

router.get('/', CommentController.getComments);

router.get('/:id', CommentController.getSubComments);

router.post('/', ArticleValidator.createCommentValidator, CommentController.createComment);

router.post('/:id', ArticleValidator.createCommentValidator, CommentController.createComment);

export default router;
