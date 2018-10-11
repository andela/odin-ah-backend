import db from '../../models';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Like } = db;
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


    HttpError.throw404ErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    const existingLike = await Like.findOne({ where: { $and: [{ articleId }, { userId }] } });

    if (existingLike) {
      await Like.update({ status }, { where: { $and: [{ articleId }, { userId }] } });
      return res.status(200).json({
        status: 'success',
        message: 'successfully modified like status',
      });
    }
    Like.create({ userId, articleId, status });
    return res.status(201).json({
      status: 'success',
      message: 'successfully liked an article',
    });
  }
}
