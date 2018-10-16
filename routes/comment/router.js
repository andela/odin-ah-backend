import { Router } from 'express';
import CommentController from '../../controllers/comment/CommentController';
import ArticleValidator from '../../middlewares/validators/ArticleValidator';
import LikeController from '../../controllers/article/LikeController';
import LikeValidator from '../../middlewares/validators/LikeValidator';

const router = Router();

router.delete('/:id', ArticleValidator.idValidator, CommentController.deleteComment);

router.get('/', CommentController.getComments);

router.get('/:id', ArticleValidator.idValidator, CommentController.getSubComments);

router.post('/', ArticleValidator.createCommentValidator, CommentController.createComment);

router.post('/:id', ArticleValidator.createCommentValidator, CommentController.createComment);

router.post('/:id/reactions', LikeValidator.commentReactionValidator, LikeController.addCommentReaction);

export default router;
