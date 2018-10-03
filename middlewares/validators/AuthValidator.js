import ValidatorHelper from '../../helpers/ValidatorHelper';
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

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email can not be empty',
      });
    }
    if (!ValidatorHelper.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'It seems your email is not valid, or is incorrect',
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password can not be empty',
      });
    }
    if (!ValidatorHelper.isMinLen(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be greater than eight characters',
      });
    }

    req.body = {
      email: email.toLowerCase().trim(),
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
    const {
      username,
      email,
      password,
    } = req.body;
    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: 'Username can not be empty',
      });
    }
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email can not be empty',
      });
    }
    if (!ValidatorHelper.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'It seems your email is not valid, or is incorrect',
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password can not be empty',
      });
    }
    if (!ValidatorHelper.isMinLen(password)) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be greater than eight characters',
      });
    }

    req.body = {
      username,
      email: email.toLowerCase().trim(),
      password,
    };
    return next();
  }
}

export default AuthValidator;
