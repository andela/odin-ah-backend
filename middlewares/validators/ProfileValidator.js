import validate from 'validate.js';
import validator from 'validator';
import UserHelper from '../../helpers/UserHelper';
import ValidatorHelper from '../../helpers/ValidatorHelper';
import ValidationError from '../../helpers/exceptionHandler/ValidationError';

/**
 * @exports ProfileValidator
 * @class ProfileValidator
 * @description Handles Edit Profile validation
 * */
class ProfileValidator {
  /**
     * Validates profile update input values
     * @param  {request} request - Request object
     * @param {response} response - Request object
     * @param {next} next - calls next middleware
     * @return {response} Returns response message
     */
  static validation(request, response, next) {
    const {
      username,
      email
    } = request.body;

    if (validator.isEmpty(username)) {
      return response.status(400).json({
        message: 'Username cannot be empty'
      });
    }
    if (!validator.isAlphanumeric(username)) {
      return response.status(400).json({
        message: 'Username must be Alpha'
      });
    }
    if (!validator.isEmail(email)) {
      return response.status(400).json({
        message: 'Please enter a valid email'
      });
    }
    next();
  }

  /**
   * Validates Follows functionality
   * @async
   * @param  {request} request - Request object
   * @param {response} response - Request object
   * @param {next} next - calls next middleware
   * @return {response} Returns response message
   */
  static async validateFollow(request, response, next) {
    const { userId } = request.params;
    const id = request.authData.userId;
    if (!ValidatorHelper.isNumber(userId) || (Number(userId) === Number(id))) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid user Id'
      });
    }

    const follower = await UserHelper.findById(userId);
    if (!follower) {
      return response.status(404).json({
        status: 'error',
        message: 'User does not exist'
      });
    }
    request.data = {
      follower,
      id
    };
    next();
  }

  /**
   *
   * @static
   * @param {request} req
   * @param {response} res
   * @param {function} next
   * @returns {object} returns error object if validation error
   * @memberof ProfileValidator
   */
  static validateId(req, res, next) {
    req.params.id = Number(req.params.id);
    const errors = validate(req.params, { id: { numericality: { noStrings: true } } });
    if (errors) {
      return next(new ValidationError(errors));
    }
    next();
  }
}

export default ProfileValidator;
