import db from '../../models';
import ArticleHelper from '../../helpers/ArticleHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import Util from '../../helpers/Util';

const { Bookmark, Article } = db;

/**
 *
 * @export
 * @class BookmarkController
 */
export default class BookmarkController {
  /**
   *
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {json} success message for bookmarking articles
   * @memberof BookmarkController
   */
  static async addBookmark(req, res) {
    const { slug } = req.params;
    const { userId } = req.authData;

    const article = await ArticleHelper.findArticleBySlug(slug);
    HttpError.throwErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    const existingBookmark = await Bookmark.findOne({
      where: { $and: [{ articleId }, { userId }] }
    });
    if (existingBookmark) {
      return res.status(200).json({
        status: 'error',
        message: 'This article is already bookmarked',
      });
    }
    Bookmark.create({ userId, articleId });
    return res.status(201).json({
      status: 'success',
      message: 'successfully Bookmarked an article',
    });
  }

  /**
   *
   * @static
   * @param {object} req
   * @param {object} res
   * @returns{json} success message and list of paginated bookmark
   * @memberof BookmarkController
   */
  static async getAllBookmarkedArticle(req, res) {
    const total = await Bookmark.count();
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { userId } = req.authData;

    const { page, limit, offset } = pageInfo;
    const allBookmarks = await Bookmark.findAll({
      limit,
      offset,
      include: [
        {
          model: Article,
          as: 'article'
        },
      ],
      where: { userId }
    });

    const article = allBookmarks.map((bookmark) => {
      const {
        slug, description, body, readingTime
      } = bookmark.article;
      return {
        slug, description, body, readingTime
      };
    });

    return res.status(200)
      .json({
        data: {
          bookmarks: {
            article,
          },
          page,
          size: allBookmarks.length,
          total,
        },
        status: 'success',
        message: 'Successfully fetch all bookmarked articles.',
      });
  }

  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {json}success message on  delecting a bookmark
   * @memberof BookmarkController
   */
  static async removeBookmark(req, res) {
    const { slug } = req.params;
    const { userId } = req.authData;

    const article = await ArticleHelper.findArticleBySlug(slug);
    HttpError.throwErrorIfNull(article, 'Article not found');

    const articleId = article.id;
    Bookmark.destroy({
      where: { $and: [{ articleId }, { userId }] }
    });
    return res.status(200).json({
      status: 'success',
      message: 'successfully deleted an article Bookmarked ',
    });
  }
}
