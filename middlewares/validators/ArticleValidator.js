import Validator from '../../helpers/ValidatorHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';

/**
 * @exports ArticleValidator
 * @class ArticleValidator
 * @description Handles validation for Article endpoint
 * */
class ArticleValidator {
  /**
     * Validates user input values
     * @param  {req} req - Request object
     * @param {res} res - Request object
     * @param {next} next - calls next middleware
     * @return {res} Returns response message
     * @static
     */
  static createArticleValidator(req, res, next) {
    const {
      body,
      title,
      description,
      tags
    } = req.body;
    let message = null;
    if (Validator.isEmpty(body) || Validator.isEmpty(title) || Validator.isEmpty(description)) {
      message = 'description, title or body field cannot be empty';
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
  static updateArticleValidator(req, res, next) {
    const {
      body,
      title,
      description,
      tags
    } = req.body;
    let message = null;

    if (body && Validator.isEmpty(body)) {
      message = 'body field cannot be empty';
    }
    if (description && Validator.isEmpty(description)) {
      message = 'description field cannot be empty';
    }
    if (title && Validator.isEmpty(title)) {
      message = 'title field cannot be empty';
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
  static createCommentValidator(req, res, next) {
    const { body } = req.body;
    const { id } = req.params;
    let message = ArticleValidator.validateId(id);
    if (Validator.isEmpty(body)) {
      message = 'body field cannot be empty';
    }
    if (message) {
      return res.status(400)
        .json({
          message,
          status: 'error',
        });
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
  static idValidator(req, res, next) {
    const id = req.params.id || req.body.id;
    const message = ArticleValidator.validateId(id);
    if (message) {
      return next(new HttpError(message, 400));
    }
    return next();
  }

  /**
     *
     * @param {Array} tags
     * @return {string} checks if a tag is valid. returns an error message
     * if the tags field is not valid.
     */
  static validateTags(tags) {
    let message = null;

    if (tags && !(tags instanceof Array)) {
      message = 'tags field must be an array';
    }

    if (tags && (tags instanceof Array)) {
      message = ArticleValidator.containsValidStrings(tags);
    }

    return message;
  }

  /**
     *
     * @param {*}id
     * @return {*} returns a message if the id is not a number.
     */
  static validateId(id) {
    let message = null;
    if (id && Number.isNaN(Number(id))) {
      message = 'id must be a number';
    }
    return message;
  }

  /**
     *
     * @param {string} tags
     * @return {string} return a message if the array of tags contain an invalid tag.
     */
  static containsValidStrings(tags) {
    const invalidStrings = tags.filter(tag => Validator.isEmpty(tag));
    if (invalidStrings.length) {
      return 'tags array contains an invalid tag';
    }
    return null;
  }

  /**
     *
     * @param {string} title
     * @return {string} checks if the length of the title is valid.
     * It return an error message if title is invalid.
     */
  static validateTitleLength(title) {
    let message = null;
    if (title && title.length < 5) {
      message = 'Title must be at least 5 characters long';
    }
    if (title && title.length > 80) {
      message = 'Title must not exceed 80 characters';
    }
    return message;
  }
}

export default ArticleValidator;
