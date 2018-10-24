import validator from 'validator';
import eventBus from '../../helpers/eventBus';
import db from '../../models';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Article, User } = db;
/**
 * Provides functionality for sharing articles via email
 * @class ShareController
 */
class ShareController {
  /**
   * Validates the payload parameters passed to the mailto route
   * @static
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @param {Function} next Next middleware
   * @returns {null} Calls the next middleware
   * @memberof ShareController
   */
  static async validateInputs(req, res, next) {
    const { email: recipient } = req.body;
    if (!recipient || !validator.isEmail(recipient)) {
      return next(new HttpError('Please supply a valid email for sharing', 400));
    }
    next();
  }

  /**
   *
   *
   * @static
   * @param {Object} req Request object
   * @param {Object} res Response object
   * @param {Object} next Next middleware
   * @returns {JSON} Response sent to client
   * @memberof ShareController
   */
  static async share(req, res, next) {
    try {
      const { slug } = req;
      const { email: recipient } = req.body;
      const { userId } = req.authData;
      const articlePromise = Article.findOne({ where: { slug } });
      const senderPromise = User.findOne({ where: { id: userId } });
      const [article, sender] = await Promise.all([articlePromise, senderPromise]);
      HttpError.throwErrorIfNull(article, 'Article does not exist');
      const { private: isPrivate, isPublished } = article;
      if (isPrivate || !isPublished) {
        return next(new HttpError('This article is not available for sharing', 403));
      }
      const shareData = { sender, recipient, article };
      eventBus.emit('articleShare', shareData);
      res.status(200).json({
        status: 'success',
        message: 'Article was shared with email contact'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ShareController;
