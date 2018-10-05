import validator from 'validator';

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
      username, email
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
}

export default ProfileValidator;
