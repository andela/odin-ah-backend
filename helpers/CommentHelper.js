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
      username,
      bio,
      imageUrl
    };

    return {
      id,
      body,
      type,
      createdAt,
      author
    };
  }

  /**
   *
   * @param {Array} comments
   * @return {object} returns response data.
   */
  static getCommentsResponseData(comments) {
    return comments.map(item => CommentHelper.getCommentResponseData(item.user, item.dataValues));
  }

  /**
   *
   * @param {number} id
   * @param {Array} include
   * @return {Promise<Model>} finds a comment by its id and get list of sub-comments
   */
  static async findCommentBy(id, include = null) {
    if (!include) {
      const includeUser = {
        model: User,
        as: 'user'
      };
      include = [
        includeUser,
        {
          model: Comment,
          as: 'comments',
          include: [{ ...includeUser }]
        }];
    }
    const comment = await Comment.findOne({
      where: { id },
      include
    });
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
    const { comments } = comment;
    const toDelete = comments.map(item => (item.destroy({ force: true })));
    toDelete.push(comment.destroy({ force: true, }));
    await Promise.all(toDelete);
  }
}

export default CommentHelper;
