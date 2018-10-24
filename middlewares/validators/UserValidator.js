import validate from 'validate.js';
import moment from 'moment';
import Constraints from './constraints';
import ValidationError from '../../helpers/exceptionHandler/ValidationError';

/**
 *
 *
 * @class UserValidator
 */
class UserValidator {
  /**
     *
     *
     * @static
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns {function} returns a validator function
     * @memberof UserValidator
     */
  static beginResetPassword(req, res, next) {
    const errors = validate(req.body, Constraints.User.beginResetPassword);
    if (errors) {
      return next(new ValidationError(errors));
    }
    next();
  }

  /**
     *
     *
     * @static
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns {function} returns a validator function
     * @memberof UserValidator
     */
  static completeResetPassword(req, res, next) {
    const errors = validate(req.body, Constraints.User.completeResetPassword);
    if (errors) {
      return next(new ValidationError(errors));
    }
    next();
  }

  /**
       * Validates date input values
       * @param  {request} req - Request object
       * @param {response} res - Request object
       * @param {next} next - calls next middleware
       * @return {response} Returns response message
       */
  static readingStats(req, res, next) {
    validate.extend(validate.validators.datetime, {
      // The value is guaranteed not to be null or undefined but otherwise it
      // could be anything.
      parse(value) {
        return +moment.utc(value);
      },
      // Input is a unix timestamp
      format(value, options) {
        const format = options.dateOnly ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
        return moment.utc(value).format(format);
      }
    });
    const errors = validate(req.query, Constraints.User.readingStats);
    if (errors) {
      return next(new ValidationError(errors));
    }
    next();
  }
}


export default UserValidator;
