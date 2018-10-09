import db from '../../models';
import CommentHelper from '../../helpers/CommentHelper';
import UserHelper from '../../helpers/UserHelper';
import ArticleHelper from '../../helpers/ArticleHelper';
import logger from '../../helpers/logger';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Comment, User } = db;

/**
 * Crud controller for Comment entity
 */
export default class CommentController {
  /**
   *
   * Method for creating Authors Comment
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async getComments(req, res, next) {
    try {
      const { slug } = req;
      const article = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throw404ErrorIfNull(article, 'Article not found');

      let comments = await Comment.findAll({
        where: { $and: [{ articleId: article.id }, { parentId: null }] },
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      });

      comments = CommentHelper.getCommentsResponseData(comments);
      return res.status(200)
        .json({
          data: {
            comments,
            count: comments.length
          },
          status: 'success',
          message: 'Successfully fetch articles.'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for creating Authors Comment
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async getSubComments(req, res, next) {
    try {
      const { slug } = req;
      const { id } = req.params;
      let comment = await CommentHelper.findCommentBy(id, slug);
      const { user } = comment;
      const comments = CommentHelper.getCommentsResponseData(comment.comments);
      comment = CommentHelper.getCommentResponseData(user, comment.dataValues);
      return res.status(200)
        .json({
          comment: {
            ...comment,
            comments,
            count: comments.length
          },
          status: 'success',
          message: 'Successfully fetch articles.'
        });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }

  /**
   *
   * Method for creating Authors Comment
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async createComment(req, res, next) {
    const { slug } = req;
    const { body } = req.body;
    const { id } = req.params;
    const { userId } = req.authData;
    try {
      const article = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throw404ErrorIfNull(article, 'Article not found');
      let parent = null;
      if (id && !Number.isNaN(Number(id))) {
        parent = await Comment.findOne({
          where: { id }
        });
        // Throws an error if parent comment does not exist.
        HttpError.throw404ErrorIfNull(parent, 'comment not found');
      }
      if (parent && parent.parentId) {
        return res.status(403)
          .json({
            message: 'comment cannot go pass levels',
            status: 'error'
          });
      }

      const [user, createdComment] = await Promise.all([UserHelper.findById(userId),
        Comment.create({ body })]);

      await Promise.all([
        createdComment.setParent(parent),
        createdComment.setUser(user),
        createdComment.setArticle(article)]);
      const comment = CommentHelper.getCommentResponseData(user.dataValues,
        createdComment.dataValues);
      return res.status(201)
        .json({
          comment,
          status: 'success',
          message: 'successfully created comment'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for deleting Authors Comment
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return delete status.
   */
  static async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      const { slug } = req;
      const { userId } = req.authData;
      const comment = await CommentHelper.findCommentBy(id, slug);
      if (comment.dataValues.userId === userId) {
        await CommentHelper.deleteComments(comment);
        return res.status(200)
          .json({
            message: 'deleted article successfully',
            status: 'success',
          });
      }
      return res.status(403)
        .json({
          message: 'You cannot perform this operation',
          status: 'error',
        });
    } catch (e) {
      logger.error(e);
      next(e);
    }
  }
}
