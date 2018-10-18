import db from '../../models';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import eventBus from '../../helpers/eventBus';

const {
  Like,
  User,
  Comment,
  CommentReaction
} = db;
/**
 *
 * @description Handles user article's like
 * @export
 * @class LikeController
 */
export default class LikeController {
  /**
     * @static
     * @param {object} req
     * @param {object} res
     * @memberof LikeController
     * @return {json} Returns json object
     */
  static async addLike(req, res) {
    const { slug, status } = req.params;
    const { userId } = req.authData;

    const article = await ArticleHelper.findArticleBySlug(slug);

    HttpError.throwErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    const existingLike = await Like.findOne({ where: { $and: [{ articleId }, { userId }] } });

    if (existingLike) {
      await Like.update({ status }, { where: { $and: [{ articleId }, { userId }] } });
      return res.status(200)
        .json({
          status: 'success',
          message: 'successfully modified like status',
        });
    }
    const liked = await Like.create({
      userId,
      articleId,
      status
    });
    eventBus.emit('onArticleInteraction', {
      toUser: article.dataValues.userId,
      fromUser: liked.dataValues.userId,
      articleId: article.dataValues.id,
      type: 'like'
    });
    return res.status(201)
      .json({
        status: 'success',
        message: 'successfully liked an article',
      });
  }

  /**
     *
     * @param {request} req
     * @param {response} res
     * @param {next} next
     * @return {Promise<*>} Create or update a reaction on a comment for the authenticated user.
     * Returns a json response back to the user
     */
  static async addCommentReaction(req, res, next) {
    try {
      const commentId = req.params.id;
      const { reaction } = req.body;
      const { userId } = req.authData;
      const [user, comment] = await Promise.all([
        User.findOne({ where: { id: userId } }),
        Comment.findOne({ where: { id: commentId } }),
      ]);
      HttpError.throwErrorIfNull(comment, 'Comment does not exists');

      const where = { $and: [{ commentId }, { userId }] };
      let commentReaction = await CommentReaction.findOne({ where });
      if (!commentReaction && reaction === 'neutral') {
        HttpError.throwErrorIfNull(commentReaction, 'User haven\'t reacted to this comment', 403);
      }

      if (commentReaction) {
        await CommentReaction.update({ reaction }, { where });
        return res.status(200)
          .json({
            reaction,
            status: 'success',
            message: 'successfully modified reaction',
          });
      }
      commentReaction = await CommentReaction.create({
        reaction,
        user,
        comment
      });
      await Promise.all([commentReaction.setUser(user), commentReaction.setComment(comment)]);
      return res.status(201)
        .json({
          reaction,
          status: 'success',
          message: 'successfully reacted to this comment',
        });
    } catch (e) {
      next(e);
    }
  }
}
