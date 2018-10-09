import validate from 'validate.js';
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
}


export default UserValidator;
