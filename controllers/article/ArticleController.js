import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import logger from '../../helpers/logger';
import Util from '../../helpers/Util';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import eventBus from '../../helpers/eventBus';

const { Article, User, Tag } = db;

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
      HttpError.throwErrorIfNull(article, 'Article not found');

      const { user, tags } = article;
      let userId = null;
      article = ArticleHelper.getArticleResponseData(user, article, tags);
      if (req.authData) {
        ({ userId } = req.authData);
      }
      eventBus.emit('onNewArticleView', {
        authorId: user.dataValues.id,
        readerId: userId,
        articleSlug: article.slug
      });


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
      const total = await Article.count();
      const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
      const {
        page, limit, offset, totalPages
      } = pageInfo;

      const allArticle = await Article.findAll({
        limit,
        offset,
        include: [{
          model: Tag,
          as: 'tags'
        },
        {
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
            totalPages,
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
   * Method for getting all created Articles created by an authenticated user
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @return {object} return all articles
   */
  static async getAuthUserArticles(req, res) {
    const { userId } = req.authData;
    const total = await Article.count({ where: { userId } });
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { page, limit, offset } = pageInfo;
    const articles = await Article.findAll({
      limit,
      offset,
      where: { userId },
      order: [
        ['createdAt', 'DESC']
      ]
    });
    return res.status(200)
      .json({
        status: 'success',
        articles,
        page,
        total
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
      const slug = Util.createSlug(title);
      const article = await ArticleHelper.saveArticle(req, slug, userData);
      status = 201;
      response = {
        article,
        message: 'Article created successfully',
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
      HttpError.throwErrorIfNull(article, 'Article not found');

      if (article.dataValues.userId === userId) {
        await ArticleHelper.unLinkTags(article)
          .then(() => article.destroy({ force: true }));
        return res.status(200)
          .json({
            message: 'deleted article successfully',
            status: 'success',
          });
      }
      return next(new HttpError('You cannot perform this operation', 403));
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
      HttpError.throwErrorIfNull(articleData, 'Article not found');
      if (articleData.dataValues.userId === userId) {
        const article = await ArticleHelper.saveUpdates(req, articleData);
        res.status(200)
          .json({
            article,
            message: 'Successfully updated user article',
            status: 'success',
          });
      } else {
        next(new HttpError('You cannot perform this operation', 403));
      }
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * @param {request} req
   * @param {response} res
   * @param  {next} next
   * @return {object} return update article for user.
   */
  static async disableArticle(req, res, next) {
    const { slug } = req.params;
    try {
      const articleData = await ArticleHelper.findArticleBySlug(slug);
      HttpError.throwErrorIfNull(articleData, 'Article not found');
      const article = await articleData.update({ disabled: true });
      res.status(200)
        .json({
          article,
          message: 'Successfully disabled article',
          status: 'success',
        });
    } catch (e) {
      next(e);
    }
  }
}
