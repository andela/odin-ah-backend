import TagHelper from '../../helpers/TagHelper';
import Util from '../../helpers/Util';
import db from '../../models';

const { Tag, sequelize } = db;

const { Op } = sequelize;

/**
 * Crud controller for Tag entity
 */
export default class TagController {
  /**
   *
   * Method for getting popular tags
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {*} returns top 10 popular tags
   */
  static async getPopularTags(req, res, next) {
    try {
      const tags = await TagHelper.getPopularTags();
      return res.status(200).json({
        status: 'success',
        message: 'Fetched popular tags successfully',
        tags,
      });
    } catch (e) {
      next(e);
    }
  }

  /**
   *
   * Method for getting tags
   * Authentication Required
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {*} returns top 10 popular tags
   */
  static async getTags(req, res, next) {
    try {
      const { filter } = req.query;
      let where;
      if (filter) {
        where = {
          name: {
            [Op.iLike]: `${filter}%`
          },
        };
      }
      const total = await Tag.count({ where });
      const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
      const {
        page, limit, offset, totalPages
      } = pageInfo;

      const tags = await TagHelper.getTags({ limit, offset, where });

      return res.status(200).json(
        {
          status: 'success',
          message: 'Fetched tags successfully',
          data: {
            tags,
            page,
            totalPages,
            size: tags.length,
            total,
          }
        }
      );
    } catch (e) {
      next(e);
    }
  }
}
