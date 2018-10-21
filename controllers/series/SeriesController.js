import db from '../../models';
import UserHelper from '../../helpers/UserHelper';
import Util from '../../helpers/Util';
import SeriesHelper from '../../helpers/SeriesHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import ArticleHelper from '../../helpers/ArticleHelper';

const {
  Series, Article, User, Tag, sequelize
} = db;

/**
 * Crud controller for Series entity
 */
export default class SeriesController {
  /**
   *
   * Method for getting a specific series
   * Authentication Optional
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} returns a single series.
   */
  static async getSingleSeries(req, res, next) {
    try {
      const { slug } = req.params;

      let series = await SeriesHelper.findSeriesBySlug(slug, []);

      HttpError.throwErrorIfNull(series, 'Series not found');

      const total = await Article.count({ where: { seriesId: series.id } });
      const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
      const {
        page, limit, offset, totalPages
      } = pageInfo;
      const include = [
        {
          limit,
          offset,
          model: Article,
          as: 'articles',
          include: [{
            model: Tag,
            as: 'tags'
          }]
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: Tag,
          as: 'tags'
        }
      ];
      series = await SeriesHelper.findSeriesBySlug(slug, include);
      series = SeriesHelper.getSingleSeriesResponseData(series);
      series.articles = {
        data: series.articles,
        page,
        totalPages,
        size: series.articles.length,
        total,
      };

      return res.status(200)
        .json({
          series,
          status: 'success',
          message: 'Successfully fetched authors series'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for getting multiple series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} returns multiple series including pagination information.
   */
  static async getMultipleSeries(req, res, next) {
    try {
      const total = await Series.count();
      const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
      const {
        page, limit, offset, totalPages
      } = pageInfo;
      const series = await SeriesHelper.getAllSeries(limit, offset);
      return res.status(200)
        .json({
          data: {
            series,
            page,
            totalPages,
            size: series.length,
            total,
          },
          status: 'success',
          message: 'Successfully fetch series.'
        });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for getting multiple series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @return {object} returns multiple series including pagination information.
   */
  static async getAuthUserMultipleSeries(req, res) {
    const { userId } = req.authData;
    const total = await Series.count({ where: { userId } });
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const {
      page, limit, offset, totalPages
    } = pageInfo;
    const series = await SeriesHelper.getAllSeries(limit, offset, userId);
    return res.status(200)
      .json({
        data: {
          series,
          page,
          totalPages,
          size: series.length,
          total,
        },
        status: 'success',
        message: 'Successfully fetch series.'
      });
  }

  /**
   *
   * Method for creating Authors Series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} returns the created series.
   */
  static async createSeries(req, res, next) {
    try {
      const { title } = req.body;

      const { userId } = req.authData;
      const user = await UserHelper.findById(userId);
      const slug = Util.createSlug(title);
      const series = await SeriesHelper.saveSeries(req, slug, user);
      return res.status(201)
        .json({
          series,
          message: 'Successfully created author\'s series',
          status: 'success',
        });
    } catch (e) {
      return next(e);
    }
  }

  /**
   *
   * Method for deleting Authors Series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return delete status.
   */
  static async deleteSeries(req, res, next) {
    const { userId } = req.authData;
    const { slug } = req.params;
    const { deleteContents } = req.body;
    try {
      const series = await SeriesHelper.findSeriesBySlug(slug);
      HttpError.throwErrorIfNull(series, 'Series not found');
      if (series.userId === userId) {
        let { articles } = series;
        let articleIds = [];
        if (deleteContents) {
          articleIds = articles.map(article => article.id);
          articles = articles.map(article => ArticleHelper.unLinkTags(article));
        }
        const removeTags = SeriesHelper.unLinkTags(series);
        await sequelize.transaction(() => Promise
          .all(articles, removeTags)
          .then(() => Article.destroy({
            where: { id: articleIds },
            cascade: true
          }))
          .then(() => Series.destroy({
            where: { id: series.id },
            cascade: true
          })));

        return res.status(200)
          .json({
            message: 'deleted series successfully',
            status: 'success',
          });
      }
      return next(new HttpError('You cannot perform this operation', 403));
    } catch (e) {
      next(e);
    }
  }

  /**
   * Method for updating Authors Series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} return updated series for user.
   */
  static async updateSeries(req, res, next) {
    const { userId } = req.authData;
    const { slug } = req.params;
    try {
      let series = await SeriesHelper.findSeriesBySlug(slug);
      HttpError.throwErrorIfNull(series, 'Series not found');
      if (series.userId === userId) {
        series = await SeriesHelper.saveUpdates(req, series);
        return res.status(200)
          .json({
            series,
            message: 'Successfully updated user article',
            status: 'success',
          });
      }
      return next(new HttpError('You cannot perform this operation', 403));
    } catch (e) {
      next(e);
    }
  }

  /**
   * Method for adding an article to a specific series
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {object} returns the created article.
   */
  static async addArticlesToSeries(req, res, next) {
    try {
      const { slug } = req.params;
      const { title } = req.body;
      const id = req.authData.userId;
      const series = await SeriesHelper.findSeriesBySlug(slug, []);
      const userData = await UserHelper.findById(id);
      if (series.userId === id) {
        const articleSlug = Util.createSlug(title);
        const article = await ArticleHelper.saveArticle(req, articleSlug, userData, series);
        return res.status(201)
          .json({
            article,
            message: 'Successfully created user article',
            status: 'success',
          });
      }
      return next(new HttpError('You cannot perform this operation', 403));
    } catch (e) {
      return next(e);
    }
  }
}
