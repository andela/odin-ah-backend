import db from '../models';

const { Tag } = db;

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
}

export default TagHelper;
