import db from '../models';
import logger from '../helpers/logger';

const { ReadingStatistics } = db;
/**
 * @exports ReadingStats
 * @class ReadingStats
 * @description Handles all ReadingStatistics in the application
 * */
class ReadingStats {
/**
   *
   * method to store reading statistics views
   * @static
   * @param {integer} eventInfo
   * @returns {json} return json object to user
   * @memberof ReadingStats
   */
  static async articleViewHandler(eventInfo) {
    try {
      const { authorId, readerId, articleSlug } = eventInfo;
      const findDuplicate = await ReadingStatistics.find({
        where: {
          authorId, readerId, articleSlug, isUnique: true
        }
      });
      let isUnique;
      if (findDuplicate) {
        isUnique = false;
      } else {
        isUnique = true;
      }
      const readingStatsInfo = {
        authorId,
        readerId,
        articleSlug,
        isUnique
      };
      await ReadingStatistics.create(readingStatsInfo);
    } catch (error) {
      logger.error(error);
    }
  }
}
export default ReadingStats;
