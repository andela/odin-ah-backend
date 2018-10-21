import Validator from '../../helpers/ValidatorHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';
import ArticleValidator from './ArticleValidator';

/**
 * @exports SeriesValidator
 * @class SeriesValidator
 * @description Handles validation for Series endpoint
 * */
class SeriesValidator {
  /**
   * Validates user input values
   * @param  {req} req - Request object
   * @param {res} res - Request object
   * @param {next} next - calls next middleware
   * @return {res} Returns response message
   * @static
   */
  static createSeriesValidator(req, res, next) {
    const {
      title, description, imageUrl, tags
    } = req.body;
    let message = null;
    if (Validator.isEmpty(title) || Validator.isEmpty(description)) {
      message = 'description or title field cannot be empty';
    }
    if (imageUrl && Validator.isEmpty(imageUrl)) {
      message = 'imageUrl field cannot be empty';
    }

    message = message || ArticleValidator.validateTitleLength(title)
      || ArticleValidator.validateTags(tags);

    if (message) {
      return next(new HttpError(message, 400));
    }

    return next();
  }

  /**
   * Validates user input values
   * @param  {req} req - Request object
   * @param {res} res - Request object
   * @param {next} next - calls next middleware
   * @return {res} Returns response message
   * @static
   */
  static updateSeriesValidator(req, res, next) {
    const {
      title, description, imageUrl, tags
    } = req.body;
    let message = null;
    if (description && Validator.isEmpty(description)) {
      message = 'description field cannot be empty';
    }
    if (title && Validator.isEmpty(title)) {
      message = 'title field cannot be empty';
    }

    if (imageUrl && Validator.isEmpty(imageUrl)) {
      message = 'imageUrl field cannot be empty';
    }

    message = message || ArticleValidator.validateTitleLength(title)
      || ArticleValidator.validateTags(tags);

    if (message) {
      return next(new HttpError(message, 400));
    }
    return next();
  }

  /**
   *
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @return {res} Returns response message
   * @static
   */
  static followParams(req, res, next) {
    const { follow } = req.params;
    if (follow === 'follow' || follow === 'unfollow') {
      return next();
    }
    return next(new HttpError('Invalid parameters. follow param must be \'follow\' or \'unfollow\' ', 400));
  }
}

export default SeriesValidator;
