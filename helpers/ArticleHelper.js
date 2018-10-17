import urlSlug from 'url-slug';
import TagHelper from './TagHelper';
import db from '../models';
import HttpError from './exceptionHandler/httpError';
import Util from './Util';
import eventBus from './eventBus';

const {
  Article,
  Tag,
  User,
  ArticleTag
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
     * @param {string} username
     * @return {object} returns article field to update
     */
  static getUpdateField(req, username) {
    const field = Util.extractFieldsFromObject(['body', 'title', 'tags', 'description'],
      req.body);
    if (field.title) {
      field.slug = `${username}-${urlSlug(field.title)}`;
    }
    return field;
  }

  /**
     * Save Article into database
     * @param {request} req
     * @param {string} slug
     * @param {User} userData
     * @return {Promise<object>} return saved article
     */
  static async saveArticle(req, slug, userData) {
    const {
      body,
      title,
      tags,
      description
    } = req.body;
    const createArticle = Article.create({
      body,
      title,
      slug,
      description,
    });
    const createTags = TagHelper.findOrCreateTags(tags);

    const [articleData, tagData] = await Promise.all([createArticle, createTags]);

    if (tags) await articleData.addTags(tagData);
    await articleData.setUser(userData);

    eventBus.emit('onNewPostEvent', {
      recipientsEmail: userData.dataValues.email,
      authorId: userData.dataValues.id,
      articleId: articleData.dataValues.id,
      type: 'article'
    });

    return ArticleHelper.getArticleResponseData(userData.dataValues,
      articleData.dataValues, tagData);
  }

  /**
     *
     * @param {request} req
     * @param {Article} articleData
     * @return {Promise<object>} return json data to be sent as a response
     */
  static async saveUpdates(req, articleData) {
    const { tags } = req.body;
    const { user } = articleData;
    const [updateTag] = await Promise.all([TagHelper.findOrCreateTags(tags),
      ArticleHelper.unLinkTags(articleData)
    ]);
    const { username } = user.dataValues;
    await articleData.update(ArticleHelper.getUpdateField(req, username));
    await articleData.addTags(updateTag);
    return ArticleHelper.getArticleResponseData(user.dataValues,
      articleData.dataValues, updateTag);
  }

  /**
     *
     * @param {Article} article
     * @return {Promise<void>} remove tag dependencies from an article.
     * @constructor
     */
  static async unLinkTags(article) {
    await Promise.all(article.tags.map(tag => ArticleTag
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
     * @param {Article}article
     * @param {Array} tagList
     * @return {object} returns response data.
     */
  static getArticleResponseData(user, article, tagList) {
    const {
      title,
      body,
      description,
      slug,
      readingTime
    } = article;
    const { username, bio, imageUrl } = user;
    let tags = [];
    if (tagList && tagList.length > 0) {
      tags = tagList.map(tag => tag.dataValues.name);
    }
    const author = {
      username,
      bio,
      imageUrl
    };
    return {
      slug,
      title,
      body,
      description,
      readingTime,
      tags,
      author
    };
  }

  /**
     *
     * @param {Array}allArticle
     * @return {object} returns response data.
     */
  static getArticlesResponseData(allArticle) {
    const articles = [];
    allArticle.forEach((article) => {
      const { user, tags } = article;
      articles.push(ArticleHelper.getArticleResponseData(user,
        article, tags));
    });
    return articles;
  }

  /**
     *
     * @param {string}slug
     * @param {include} [include]
     * @return {Promise<Model>} gets an article by slug
     */
  static async findArticleBySlug(slug, include = null) {
    if (!include) {
      include = [{
        model: User,
        as: 'user',
      },
      {
        model: Tag,
        as: 'tags'
      }
      ];
    }

    return Article.findOne({
      where: { slug },
      include
    });
  }

  /**
     *
     * @param {string} slug
     * @return {Promise<void>} Throws an error if article already.
     */
  static async throwErrorIfArticleExists(slug) {
    const article = await ArticleHelper.findArticleBySlug(slug);
    if (article) {
      throw new HttpError('Article already exists. Use PUT to update article', 409);
    }
    return null;
  }
}

export default ArticleHelper;
