import db from '../models';
import Util from './Util';
import TagHelper from './TagHelper';

const {
  Article, Tag, User, Series, SeriesTags
} = db;

/**
 * Helper class for Series Controller
 */
class SeriesHelper {
  /**
   *
   * @param {request} req
   * @param {string} slug
   * @param {User} user
   * @return {Promise<object>} saves and returns the series
   */
  static async saveSeries(req, slug, user) {
    const {
      description, title, imageUrl: seriesImageUrl, tags
    } = req.body;
    let createTags = TagHelper.findOrCreateTags(tags);
    let createdSeries = Series.create({
      description,
      title,
      slug,
      imageUrl: seriesImageUrl
    })
      .then(series => series.setUser(user));
    [createdSeries, createTags] = await Promise.all([createdSeries, createTags]);
    if (tags) {
      await createdSeries.addTags(createTags);
    }
    return SeriesHelper.getResponseData(createdSeries, user, null, createTags);
  }

  /**
   *
   * @param {Series} series
   * @param {User} [userInfo]
   * @param {Array<Article>} [articleList]
   * @param {Array<Tag>} [tagList]
   * @return {object} returns the series data to be sent to the user
   */
  static getResponseData(series, userInfo, articleList, tagList) {
    if (!userInfo) {
      userInfo = series.user;
    }
    let articles;
    if (articleList) {
      articles = articleList.map((article) => {
        const tags = SeriesHelper.getTagName(article.tags);
        const {
          title, description, body, slug, readingTime
        } = article;
        return {
          title,
          description,
          body,
          slug,
          readingTime,
          tags
        };
      });
    }

    const {
      description, slug, title, imageUrl: seriesImageUrl
    } = series;
    const { username, bio, imageUrl } = userInfo;
    const author = {
      username,
      bio,
      imageUrl
    };
    const tags = SeriesHelper.getTagName(tagList);
    return {
      description,
      title,
      slug,
      articles,
      tags,
      imageUrl: seriesImageUrl,
      author
    };
  }

  /**
   *
   * @param {req} req
   * @return {object} returns article field to update
   */
  static getUpdateField(req) {
    const field = Util.extractFieldsFromObject(['imageUrl', 'title', 'description'],
      req.body);
    if (field.title) {
      field.slug = Util.createSlug(field.title);
    }
    return field;
  }

  /**
   *
   * @param {Array<Tag>} tags
   * @return {Array<string>} returns a list of tag name
   */
  static getTagName(tags) {
    return tags.map(tag => tag.name);
  }

  /**
   *
   * @param {request} req
   * @param {Article} series
   * @return {Promise<object>} return json data to be sent as a response
   */
  static async saveUpdates(req, series) {
    const { tags } = req.body;
    const [updateTag] = await Promise.all([TagHelper.findOrCreateTags(tags),
      SeriesHelper.unLinkTags(series)]);
    await Promise.all([
      series.update(SeriesHelper.getUpdateField(req)),
      series.addTags(updateTag)]);
    return SeriesHelper.getResponseData(series, null, null, updateTag);
  }

  /**
   *
   * @param {Series} series
   * @return {object} returns the series data to be sent to the user
   */
  static getSingleSeriesResponseData(series) {
    const {
      articles, user, tags
    } = series;
    return SeriesHelper.getResponseData(series, user, articles, tags);
  }

  /**
   *
   * @param {string}slug
   * @param {Array} [include]
   * @return {Promise<Model>} gets an article by slug
   */
  static async findSeriesBySlug(slug, include = null) {
    if (!include) {
      include = [
        {
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
    }

    return Series.findOne({
      where: { slug },
      include
    });
  }

  /**
   *
   * @param {Array<Series>} series
   * @return {Array<object>} returns an array of series response data
   */
  static getMultipleSeriesResponseData(series) {
    return series.map(item => SeriesHelper.getSingleSeriesResponseData(item));
  }

  /**
   *
   * @param {number} id
   * @return {Promise<Series>} Find and return a series by Id.
   */
  static async findSeriesById(id) {
    return Series.findOne({ where: { id } });
  }

  /**
   *
   * @param {number} limit
   * @param {number} offset
   * @param {number} [userId]
   * @return {Promise<Array<Series>>} Gets a list of series based on the limit and offset
   * provided. Include a user id to filter the list based on the user id
   */
  static async getAllSeries(limit, offset, userId = null) {
    let where;
    if (userId) {
      where = { userId };
    }
    let series = await Series.findAll({
      where,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Tag,
          as: 'tags'
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    });
    series = SeriesHelper.getMultipleSeriesResponseData(series);
    return series;
  }

  /**
   *
   * @param {number} id
   * @return {Promise<Series>} h
   */
  static async getSeriesWithFollowers(id) {
    return Series.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'followers'
      }]
    });
  }

  /**
   *
   * @param {Series} series
   * @return {Promise<Article>} remove tag dependencies from an series.
   * @constructor
   */
  static async unLinkTags(series) {
    return Promise.all(series.tags.map(tag => SeriesTags
      .destroy({
        where: {
          seriesId: series.id,
          tagId: tag.id
        }
      })));
  }
}

export default SeriesHelper;
