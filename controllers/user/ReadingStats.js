import { Op } from 'sequelize';
import db from '../../models';
import logger from '../../helpers/logger';

const { Article, Tag, ReadingStatistics } = db;
/**
 * @exports ReadingStats
 * @class ReadingStats
 * @description Handles all ReadingStatistics in the application
 * */
class ReadingStats {
  /**
   *
   *
   * @static
   * @param {request} request
   * @param {response} response
   * @param {function} next
   * @returns {json} return json object to user
   * @memberof ReadingStats
   */
  static async getReadingStats(request, response, next) {
    try {
      const { userId } = request.authData;
      const { tag, startDate, endDate } = request.query;
      if (!(tag || startDate || endDate)) {
        const totalArticles = await Article.findAndCountAll({ where: { userId } });
        const id = totalArticles.rows.map(key => key.id);
        const unique = await ReadingStatistics
          .count({ where: { authorId: id, isUnique: true } });
        const notUniqueViews = await ReadingStatistics
          .count({ where: { authorId: id, isUnique: false } });
        return response.status(200).json({
          count: totalArticles.count,
          uniqueViews: unique,
          allViews: (unique + notUniqueViews),
          message: 'Reading statistics retrieved Successfully'
        });
      }
      let articleFetchFilter = {
        where: {
          userId,
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate || new Date()
          }
        },
      };
      if (tag) {
        articleFetchFilter = {
          ...articleFetchFilter,
          include: [
            {
              model: Tag,
              as: 'tags',
              where: {
                name: tag
              }
            }
          ]
        };
      }
      const totalArticles = await Article.findAndCountAll(articleFetchFilter);
      const id = totalArticles.rows.map(key => key.id);

      const unique = await ReadingStatistics
        .count({ where: { authorId: id, isUnique: true } });
      const notUniqueViews = await ReadingStatistics
        .count({ where: { authorId: id, isUnique: false } });
      return response.status(200)
        .json({
          totalArticles,
          uniqueViews: unique,
          allViews: (unique + notUniqueViews),
          message: 'Reading statistics retrieved Successfully'
        });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }
}
export default ReadingStats;
