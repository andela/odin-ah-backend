import db from '../../models';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import eventBus from '../../helpers/eventBus';

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


    HttpError.throwErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    const existingLike = await Like.findOne({ where: { $and: [{ articleId }, { userId }] } });

    if (existingLike) {
      await Like.update({ status }, { where: { $and: [{ articleId }, { userId }] } });
      return res.status(200).json({
        status: 'success',
        message: 'successfully modified like status',
      });
    }
    const liked = await Like.create({ userId, articleId, status });

    eventBus.emit('onArticleInteraction', {
      toUser: article.dataValues.userId,
      fromUser: liked.dataValues.userId,
      articleId: article.dataValues.id,
      type: 'like'
    });

    return res.status(201).json({
      status: 'success',
      message: 'successfully liked an article',
    });
  }
}
