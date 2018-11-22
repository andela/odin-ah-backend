import TagHelper from './TagHelper';
import db from '../models';
import HttpError from './exceptionHandler/httpError';
import Util from './Util';
import eventBus from './eventBus';
import SeriesHelper from './SeriesHelper';

const {
  Article, Tag, User, Like, Bookmark, ArticleTag,
} = db;

/**
 * Helper class for Article Controller
 */
class ArticleHelper {
  /** **********************
   *   Helper functions    *
   *********************** */

  /**
   *
   * @param {req} req
   * @return {object} returns article field to update
   */
  static getUpdateField(req) {
    const field = Util.extractFieldsFromObject(['body', 'title', 'tags', 'description', 'imageUrl'],
      req.body);
    if (field.title) {
      field.slug = Util.createSlug(field.title);
    }
    return field;
  }

  /**
   * Save Article into database
   * @param {request} req
   * @param {string} slug
   * @param {User} user
   * @param {Series} [series]
   * @return {Promise<object>} return saved article
   */
  static async saveArticle(req, slug, user, series = null) {
    const {
      body, title, tags, description, imageUrl, published: isPublished, private: isPrivate
    } = req.body;
    const createArticle = Article.create({
      body,
      title,
      slug,
      imageUrl,
      description,
      isPublished,
      isPrivate,
    });
    const createTags = TagHelper.findOrCreateTags(tags);

    const [article, tagData] = await Promise.all([createArticle, createTags]);
    const update = [];
    if (tags) {
      update.push(article.addTags(tagData));
    }
    let seriesId;
    if (series) {
      seriesId = series.id;
      update.push(article.setSeries(series));
    }
    update.push(article.setUser(user));
    await Promise.all(update);
    eventBus.emit('onNewPostEvent', {
      recipientsEmail: user.email,
      authorId: user.id,
      articleId: article.dataValues.id,
      seriesId,
      type: 'article'
    });
    return ArticleHelper.getArticleResponseData(user.dataValues,
      article.dataValues, tagData);
  }

  /**
   *
   * @param {request} req
   * @param {Article} articleData
   * @return {Promise<object>} return json data to be sent as a response
   */
  static async saveUpdates(req, articleData) {
    const { tags, seriesId } = req.body;
    const { user } = articleData;
    let seriesPromise;
    if (seriesId) {
      const series = await SeriesHelper.findSeriesById(seriesId);
      HttpError.throwErrorIfNull(series, 'Series not found');
      seriesPromise = articleData.setSeries(series);
    }
    const [updateTag] = await Promise.all([TagHelper.findOrCreateTags(tags),
      ArticleHelper.unLinkTags(articleData)]);
    const updateFieldsPromise = articleData.update(ArticleHelper.getUpdateField(req));
    const updateTagPromise = articleData.addTags(updateTag);
    await Promise.all([updateFieldsPromise, updateTagPromise, seriesPromise]);
    return ArticleHelper.getArticleResponseData(user.dataValues,
      articleData.dataValues, updateTag);
  }

  /**
   *
   * @param {Article} article
   * @return {Promise<Article>} remove tag dependencies from an article.
   * @constructor
   */
  static async unLinkTags(article) {
    return Promise.all(article.tags.map(tag => ArticleTag
      .destroy({
        where: {
          articleId: article.id,
          tagId: tag.id
        }
      })));
  }

  /**
   *
   * @param {User} user
   * @param {Article} article
   * @param {Array} tagList
   * @param {object} [reaction]
   * @param {boolean} [hasBookmarked]
   * @return {object} returns response data.
   */
  static getArticleResponseData(user, article, tagList, reaction, hasBookmarked) {
    const {
      title, body, description, slug, readingTime, isPublished, isPrivate, createdAt, imageUrl: url
    } = article;
    const {
      username, bio, imageUrl, id
    } = user;
    const tags = tagList.map(tag => tag.name);

    const author = {
      id,
      username,
      name: Util.getFullName(user),
      bio,
      imageUrl
    };
    return {
      slug,
      title,
      body,
      description,
      imageUrl: url,
      readingTime,
      isPublished,
      isPrivate,
      createdAt,
      tags,
      author,
      reaction,
      hasBookmarked
    };
  }

  /**
   *
   * @param {Array}allArticle
   * @param {number} [userId]
   * @return {object} returns response data.
   */
  static async getArticlesResponseData(allArticle, userId) {
    return Promise.all(allArticle
      .map(async article => ArticleHelper.getFullArticleData(article, userId)));
  }

  /**
   *
   * @param {Article} article
   * @param {number} [userId]
   * @return {Promise<object>} return article with it reaction details
   */
  static async getFullArticleData(article, userId = null) {
    const {
      user, tags
    } = article;
    const values = [
      ArticleHelper.getLikeCount(article.id, 'like'),
      ArticleHelper.getLikeCount(article.id, 'dislike')];
    if (userId) {
      const where = { userId, articleId: article.id };
      values.push(Like.findOne({ where }));
      values.push(Bookmark.findOne({ where }));
    }
    const [likeCount, dislikeCount, like, bookmark] = await Promise.all(values);
    const {
      hasReacted, hasBookmarked, status
    } = ArticleHelper.extractReactionData(userId, like, bookmark);
    const reaction = {
      likeCount,
      dislikeCount,
      hasReacted,
      status,
    };
    return (ArticleHelper.getArticleResponseData(user,
      article, tags, reaction, hasBookmarked));
  }

  /**
   *
   * @param {number} userId
   * @param {Like} like
   * @param {Bookmark} bookmark
   * @return {{hasReacted: boolean, hasBookmarked: boolean, status: string}}
   * returns bookmark and reaction status
   */
  static extractReactionData(userId, like, bookmark) {
    let status, hasReacted, hasBookmarked;
    if (userId) {
      hasReacted = false;
      hasBookmarked = false;
      status = 'neutral';
      if (like) {
        ({ status } = like);
        hasReacted = true;
      }
      if (bookmark) {
        hasBookmarked = true;
      }
    }
    return {
      hasReacted,
      hasBookmarked,
      status
    };
  }

  /**
   *
   * @param {string}slug
   * @param {Array} [include]
   * @return {Promise<Model>} gets an article by slug
   */
  static async findArticleBySlug(slug, include = null) {
    if (!include) {
      include = [
        {
          model: User,
          as: 'user',
        },
        {
          model: Tag,
          as: 'tags'
        }];
    }

    return Article.findOne({
      where: { slug },
      include
    });
  }

  /**
   *
   * @param {number}articleId
   * @param {'like' | 'dislike' }  status
   * @return {Promise<number>} Returns the number of like or dislike of an article
   *
   */
  static async getLikeCount(articleId, status) {
    return Like.count({
      where: {
        articleId,
        status,
      }
    });
  }
}

export default ArticleHelper;
