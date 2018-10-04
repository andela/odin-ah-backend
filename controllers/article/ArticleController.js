import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import logger from '../../helpers/logger';
import Util from '../../helpers/Util';
import { DEFAULT_LIMIT } from '../../helpers/constants';
import ArticleHelper from '../../helpers/ArticleHelper';

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
   * @return {object} return create article for user.
   */
  static async getArticle(req, res) {
    const { slug } = req.params;
    let article = await ArticleHelper.findArticleBySlug(slug);
    if (!article) {
      return res.status(404)
        .json({
          message: 'Article not found',
          status: 'error'
        });
    }
    const { user } = article;

    article = ArticleHelper.getArticleResponseData(user.dataValues,
      article.dataValues);

    return res.status(200)
      .json({
        article,
        status: 'success',
        message: 'Successfully fetched authors article'
      });
  }

  /**
   *
   * Method for creating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @return {object} return create article for user.
   */
  static async getArticles(req, res) {
    const { size } = req.query;
    let { page } = req.query;
    let offset;
    const pageNumber = Number(page);
    if (!Number.isNaN(pageNumber) && pageNumber > 0) {
      offset = page;
    } else {
      offset = 1;
      page = 1;
    }
    let limit;

    const sizeNumber = Number(size);
    if (!Number.isNaN(sizeNumber) && sizeNumber > 0) {
      limit = size || DEFAULT_LIMIT;
    } else {
      limit = DEFAULT_LIMIT;
    }

    const totalArticle = await Article.findAndCountAll();

    const total = totalArticle.count;
    const totalPages = Math.ceil(total / limit);
    offset = Math.min(totalPages, offset);
    offset = (offset - 1) * limit;

    const allArticle = await Article.findAll({
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user'
        }]
    });
    const articles = [];
    allArticle.forEach((article) => {
      const { user } = article;
      articles.push(ArticleHelper.getArticleResponseData(user,
        article.dataValues));
    });
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
      let article = await ArticleHelper.findArticleBySlug(slug);
      if (article) {
        status = 409;
        response = {
          message: 'Article already exists. Use PUT to update article',
          status: 'error',
        };
      } else {
        article = await ArticleHelper.saveArticle(req, slug, userData);
        status = 201;
        response = {
          article,
          message: 'Successfully created user article',
          status: 'success',
        };
      }
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
   * @return {object} return delete status.
   */
  static async deleteArticle(req, res) {
    const { userId } = req.authData;
    const { slug } = req.params;
    const article = await ArticleHelper.findArticleBySlug(slug);
    if (!article) {
      return res.status(404)
        .json({
          message: 'Article Not found',
          status: 'error',
        });
    }
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
  }

  /**
   * Method for updating Authors Article
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @return {object} return update article for user.
   */
  static async updateArticles(req, res) {
    const { userId } = req.authData;
    const { slug } = req.params;
    const articleData = await ArticleHelper.findArticleBySlug(slug);
    if (!articleData) {
      return res.status(404)
        .json({
          message: 'Article Not found',
          status: 'error',
        });
    }
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
  }
}
