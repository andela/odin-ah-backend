import ValidatorHelper from '../../helpers/ValidatorHelper';
import HttpError from '../../helpers/exceptionHandler/httpError';

/**
 * @exports AuthValidator
 * @class AuthValidator
 * @description Handles all Authentication route validation
 * */
class AuthValidator {
  /**
   * Validates user input values
   * @param  {req} req - Request object
   * @param {res} res - Request object
   * @param {next} next - calls next middleware
   * @return {res} Returns response message
   * @static
   */
  static validateLogin(req, res, next) {
    const {
      email,
      password,
    } = req.body;

    let message = null;
    if (!email) {
      message = 'Email can not be empty';
    }
    if (!ValidatorHelper.isEmail(email)) {
      message = 'It seems your email is not valid, or is incorrect';
    }

    if (!password) {
      message = 'Password can not be empty';
    }
    if (password && !ValidatorHelper.isMinLen(password)) {
      message = 'Password must be greater than eight characters';
    }

    if (message) {
      return res.status(400)
        .json({
          status: 'error',
          message
        });
    }

    req.body = {
      email: email.toLowerCase()
        .trim(),
      password,
    };
    return next();
  }

  /**
   * Validates user signup input values
   * @param  {req} req - Request object
   * @param {res} res - Request object
   * @param {next} next - calls next middleware
   * @return {res} Returns response message
   * @static
   */
  static validatesignup(req, res, next) {
    try {
      const {
        username,
        email,
        password,
      } = req.body;
      HttpError.throwErrorIfNull(username, 'Username can not be empty', 400);
      HttpError.throwErrorIfNull(email, 'Email can not be empty', 400);
      HttpError.throwErrorIfNull(password, 'Password can not be empty', 400);

      if (!ValidatorHelper.isEmail(email)) {
        return next(new HttpError('It seems your email is not valid, or is incorrect', 400));
      }
      if (!ValidatorHelper.isMinLen(password)) {
        return next(new HttpError('Password must be greater than eight characters', 400));
      }

      req.body = {
        username,
        email: email.toLowerCase()
          .trim(),
        password,
      };
      return next();
    } catch (e) {
      next(e);
    }
  }
}

export default AuthValidator;
