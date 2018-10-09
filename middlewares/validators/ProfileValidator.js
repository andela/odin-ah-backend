import validator from 'validator';
import UserHelper from '../../helpers/UserHelper';
import ValidatorHelper from '../../helpers/ValidatorHelper';
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
}

export default ProfileValidator;
