import db from '../models';

const { sequelize, Tag, Article } = db;
const { Op } = sequelize;

/**
 * @class SearchEngine
 */
class SearchEngine {
  /**
   *Creates an instance of SearchEngine.
   * @param {String} query Search query
   * @memberof SearchEngine
   */
  constructor(query) {
    this.query = query;
    this.searchFilters = {
      where: {
        title: {
          [Op.iLike]: `%${query}%`
        }
      }
    };
    this.pagination = { limit: 10, offset: 0 };
  }

  /**
   *
   *
   * @param {Object} filters
   * @memberof SearchEngine
   * @returns {null} Sets searchFilters
   */
  setFilters(filters) {
    const { tag, author } = filters;
    if (tag) {
      this.searchFilters = {
        ...this.searchFilters,
        include: [
          {
            model: Tag,
            as: 'tags',
            where: { id: tag }
          }
        ]
      };
    }
    if (author) {
      this.searchFilters.where = {
        ...this.searchFilters.where,
        userId: author
      };
    }
  }

  /**
   *
   *
   * @param {Object} pageInfo Current pagination state
   * @memberof SearchEngine
   * @returns {null} Sets pagination
   */
  setPagination(pageInfo) {
    const { limit, page } = pageInfo;
    const offset = (page - 1) * limit;
    this.pagination = { ...this.pagination, limit, offset };
  }

  /**
   *
   *
   * @param {SequelizeModel} [model=Article]
   * @returns {Promise<Object>} A promise that resolves into total count and rows
   * @memberof SearchEngine
   */
  async execute(model = Article) {
    const { limit, offset } = this.pagination;
    return model.findAndCountAll({
      limit,
      offset,
      ...this.searchFilters
    });
  }
}

export default SearchEngine;
