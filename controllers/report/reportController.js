import db from '../../models';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import Util from '../../helpers/Util';

const { Report } = db;

/**
 * @export
 * @class ReportController
 */
export default class ReportController {
  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {res} Returns response message
   * @memberof ReportController
   */
  static async reportArticle(req, res) {
    const { reportType, description } = req.body,
      { userId } = req.authData,
      { slug } = req.params;

    const article = await ArticleHelper.findArticleBySlug(slug);
    HttpError.throwErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    const existingReport = await Report.findOne({
      where: { $and: [{ articleId }, { userId }] }
    });
    if (existingReport) {
      return res.status(200).json({
        status: 'error',
        message: 'This article has already been reported',
      });
    }

    Report.create({
      userId, articleId, reportType, description
    });
    return res.status(201).json({
      status: 'success',
      message: 'successfully reported an article',

    });
  }

  /**
   *
   *
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {res} Returns response message
   * @memberof ReportController
   */
  static async getAllReportededArticles(req, res) {
    const total = await Report.count();
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { userId } = req.authData;

    const { page, limit, offset } = pageInfo;
    const allReports = await Report.findAll({
      limit,
      offset,
      where: { userId }
    });

    const reports = allReports.map((report) => {
      const {
        id, articleId, reportType, description
      } = report;
      return {
        id, articleId, reportType, description
      };
    });

    return res.status(200)
      .json({
        data: {
          reports,
          page,
          size: allReports.length,
          total,
        },
        status: 'success',
        message: 'Successfully fetch all reported articles.',
      });
  }
}
