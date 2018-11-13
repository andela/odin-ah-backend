import db from '../models';

const {
  Tag, ArticleTag, Sequelize, sequelize
} = db;

/**
 * @exports TagHelper
 * @class TagHelper
 * @description Contains methods to assist Tag
 * */
class TagHelper {
  /**
   *
   * @param {Array<string>}tags
   * @return {Promise<Array>} returns a Promise
   */
  static async findOrCreateTags(tags) {
    const tagList = await Promise.all(TagHelper.getTagObj(tags));
    const tagData = [];
    tagList.forEach((tag) => {
      tagData.push(tag[0]);
    });
    return tagData;
  }

  /**
   *
   * @param {Array} tags
   * @return {Array} Returns array of tag object to be stored in the database
   */
  static getTagObj(tags) {
    const result = [];
    if (tags) {
      tags.forEach((tag) => {
        result.push(Tag.findOrCreate({ where: { name: tag } }));
      });
    }
    return result;
  }

  /**
   * @param {{offset: number, limit: number}} query
   * @return {Promise<Array<Model>>} returns most used tags
   */
  static async getPopularTags(query = { offset: 0, limit: 10 }) {
    const { offset, limit } = query;
    const popularTags = await ArticleTag.findAll({
      offset,
      limit,
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('tagId')), 'tags'], 'tagId'],
      group: ['tagId'],
      order: [
        [sequelize.fn('COUNT', sequelize.col('tagId')), 'DESC'],
      ]
    });
    const popularTagIds = popularTags.map(tags => tags.tagId);
    const tags = await Tag.findAll({
      where: {
        id: popularTagIds
      }
    });

    return tags.map(tag => tag.name);
  }

  /**
   *
   * @param {string} filter
   * @return {Promise<void>} Get list of tags that matches the filter
   */
  static async getTags({ limit, offset, where }) {
    const tags = Tag.findAll({ limit, offset, where });
    return tags.map(tag => tag.name);
  }
}

export default TagHelper;
