import validator from 'validator';
import Validator from '../../helpers/ValidatorHelper';

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
      body, title, description
    } = req.body;
    let message = null;
    if (Validator.isEmpty(body) || Validator.isEmpty(title) || Validator.isEmpty(description)) {
      message = 'description, title or body field cannot be empty';
    }
    if (title && !validator.isLength(title, { min: 5 })) {
      message = 'Title must be at least 5 characters long';
    }

    if (message) {
      return res.status(400)
        .json({
          status: 'error',
          message,
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
  static updateArticleValidator(req, res, next) {
    const {
      body, title, description
    } = req.body;
    let message = null;

    if (body && Validator.isEmpty(body)) {
      message = 'body field cannot be empty';
    }
    if (title && Validator.isEmpty(title)) {
      message = 'title field cannot be empty';
    }
    if (description && Validator.isEmpty(description)) {
      message = 'description field cannot be empty';
    }
    if (title && !validator.isLength(title, { min: 5 })) {
      message = 'Title must be at least 5 characters long';
    }

    if (message) {
      return res.status(400)
        .json({
          status: 'error',
          message,
        });
    }
    return next();
  }
}

export default ArticleValidator;
