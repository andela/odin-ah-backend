import HttpError from '../../helpers/exceptionHandler/httpError';
import ArticleValidator from './ArticleValidator';

/**
 *
 *
 * @export
 * @class LikeValidator
 */
export default class LikeValidator {
  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns {function} Returns response message
   * @memberof LikeValidator
   */
  static addLikeValidator(req, res, next) {
    const { status } = req.params;
    if (LikeValidator.isReactionValid(status)) {
      return next();
    }
    return next(new HttpError('status can only be either like, dislike or neutral.', 400));
  }

  /**
   *
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {*} validates reactions parameters
   */
  static commentReactionValidator(req, res, next) {
    const { reaction } = req.body;
    const { id } = req.params;

    let message = ArticleValidator.validateId(id);

    if (!reaction || !LikeValidator.isReactionValid((reaction))) {
      message = 'reaction can only be either like, dislike or neutral ';
    }
    if (message) {
      return next(new HttpError(message, 400));
    }

    return next();
  }

  /**
   *
   * @param { 'like' |'dislike' | 'neutral'  } reaction
   * @return {boolean} checks if reaction is valid.
   */
  static isReactionValid(reaction) {
    return reaction === 'like' || reaction === 'dislike' || reaction === 'neutral';
  }
}
