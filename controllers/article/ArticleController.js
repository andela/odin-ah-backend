import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import logger from '../../helpers/logger';
import Util from '../../helpers/Util';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Article, User } = db;

/**
 * Crud controller for Article entity
 */
export default class ArticleController {
  /**
   *
   * Method for creating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async getArticle(req, res, next) {
    const { slug } = req.params;
    try {
      let article = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throw404ErrorIfNull(article, 'Article not found');

      const { user } = article;

      article = ArticleHelper.getArticleResponseData(user.dataValues,
        article.dataValues);

      return res.status(200)
        .json({
          article,
          status: 'success',
          message: 'Successfully fetched authors article'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for creating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async getArticles(req, res, next) {
    try {
      const totalArticle = await Article.findAndCountAll();
      const total = totalArticle.count;
      const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
      const { page, limit, offset } = pageInfo;

      const allArticle = await Article.findAll({
        limit,
        offset,
        include: [{
          model: User,
          as: 'user'
        }]
      });
      const articles = ArticleHelper.getArticlesResponseData(allArticle);
      return res.status(200)
        .json({
          data: {
            articles,
            page,
            size: allArticle.length,
            total,
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
   * Method for creating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return create article for user.
   */
  static async createArticle(req, res, next) {
    let response = null;
    let status = 0;
    try {
      const { title } = req.body;
      const id = req.authData.userId;
      const userData = await UserHelper.findById(id);
      const { username } = userData.dataValues;
      const slug = Util.createSlug(username, title);
      await ArticleHelper.throwErrorIfArticleExists(slug);
      const article = await ArticleHelper.saveArticle(req, slug, userData);
      status = 201;
      response = {
        article,
        message: 'Successfully created user article',
        status: 'success',
      };
    } catch (e) {
      logger.error(e);
      return next(e);
    }
    return res.status(status)
      .json(response);
  }

  /**
   *
   * Method for deleting Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return delete status.
   */
  static async deleteArticle(req, res, next) {
    const { userId } = req.authData;
    const { slug } = req.params;
    try {
      const article = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throw404ErrorIfNull(article, 'Article not found');

      if (article.dataValues.userId === userId) {
        await article.destroy({ force: true });
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
      next(e);
    }
  }

  /**
   * Method for updating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return update article for user.
   */
  static async updateArticles(req, res, next) {
    const { userId } = req.authData;
    const { slug } = req.params;
    try {
      const articleData = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throw404ErrorIfNull(articleData, 'Article not found');
      if (articleData.dataValues.userId === userId) {
        const article = await ArticleHelper.saveUpdates(req, articleData);
        res.status(200)
          .json({
            article,
            message: 'Successfully updated user article',
            status: 'success',
          });
      } else {
        res.status(403)
          .json({
            message: 'You cannot perform this operation',
            status: 'error',
          });
      }
    } catch (e) {
      next(e);
    }
  }
}
