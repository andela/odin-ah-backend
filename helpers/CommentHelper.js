import ArticleHelper from './ArticleHelper';
import db from '../models';
import HttpError from './exceptionHandler/httpError';

const { User, Comment } = db;
/**
 * Helper class for Comment Controller
 */
class CommentHelper {
  /**
   *
   * @param {User} user
   * @param {Comment} comment
   * @return {object} returns response data.
   */
  static getCommentResponseData(user, comment) {
    const {
      id, body, type, createdAt
    } = comment;
    const { username, bio, imageUrl } = user;
    const author = {
      username, bio, imageUrl
    };

    return {
      id, body, type, createdAt, author
    };
  }

  /**
   *
   * @param {Array} comments
   * @return {object} returns response data.
   */
  static getCommentsResponseData(comments) {
    const result = [];
    comments.forEach((item) => {
      result.push(CommentHelper.getCommentResponseData(item.user, item.dataValues));
    });
    return result;
  }

  /**
   *
   * @param {number} id
   * @param {string} slug
   * @return {Promise<Model>} finds a comment by its id and get list of sub-comments
   */
  static async findCommentBy(id, slug) {
    const includeUser = {
      model: User,
      as: 'user'
    };
    const [article, comment] = await Promise.all([ArticleHelper.findArticleBySlug(slug),
      Comment.findOne({
        where: { id },
        include: [
          includeUser,
          {
            model: Comment,
            as: 'comments',
            include: [{ ...includeUser }]
          }]
      })]);
    if (!article) {
      throw new HttpError('article not found', 404);
    }
    if (!comment) {
      throw new HttpError('comment not found', 404);
    }
    return comment;
  }

  /**
   *
   * @param {Comment} comment
   * @return {Promise<void>} Delete all comment and its sub-comments
   */
  static async deleteComments(comment) {
    const toDelete = [];
    const { comments } = comment;
    toDelete.push(comment.destroy({ force: true, }));
    if (comments) {
      comments.forEach((item) => {
        toDelete.push(item.destroy({ force: true }));
      });
    }
    await Promise.all(toDelete);
  }
}

export default CommentHelper;
