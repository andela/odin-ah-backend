import urlSlug from 'url-slug';
import db from '../models';

const { Article, User } = db;

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
    const {
      body, title, description
    } = req.body;
    const field = {};
    if (title) {
      field.title = (title);
      field.slug = `${username}-${urlSlug(title)}`;
    }
    if (body) field.body = body;
    if (description) field.description = description;
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
      body, title, description
    } = req.body;
    const articleData = await Article.create({
      body,
      title,
      slug,
      description,
    });

    await articleData.setUser(userData);

    return ArticleHelper.getArticleResponseData(userData.dataValues,
      articleData.dataValues);
  }

  /**
   *
   * @param {request} req
   * @param {Article} articleData
   * @return {Promise<object>} return json data to be sent as a response
   */
  static async saveUpdates(req, articleData) {
    const userData = articleData.user;
    const { username } = userData.dataValues;
    await articleData.update(ArticleHelper.getUpdateField(req, username));
    return ArticleHelper.getArticleResponseData(userData.dataValues,
      articleData.dataValues);
  }

  /**
   *
   * @param {User} user
   * @param {Article}article
   * @return {object} returns response data.
   */
  static getArticleResponseData(user, article) {
    const {
      title, body, description, slug
    } = article;
    const { username, bio, image } = user;

    const author = {
      username, bio, image
    };
    return {
      slug, title, body, description, author
    };
  }

  /**
   *
   * @param {string}slug
   * @return {Promise<Model>} gets an article by slug
   */
  static async findArticleBySlug(slug) {
    return Article.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'user',
        }
      ]

    });
  }
}

export default ArticleHelper;
