import bcrypt from 'bcrypt';
import Authorization from '../../middlewares/Authorization';
import UserHelper from '../../helpers/UserHelper';


/**
 * @exports AuthController
 * @class AuthController
 * @description Handles the user registartion and Sigin
 * */
class AuthController {
  /**
     * Authenticate and Login the User to the application
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @param {function} next - next middleware
     * @return {json} Returns json object
     * @static
     */
  static async login(req, res) {
    const { email, password } = req.body;
    const foundUser = await UserHelper.findByEmail(email);
    if (foundUser) {
      const ValidPassword = await bcrypt.compare(password, foundUser.dataValues.password);
      if (ValidPassword) {
        const {
          id,
          username,
          bio,
          image
        } = foundUser.dataValues;
        const token = Authorization.generateToken(id);
        return res.status(200).json({
          user: {
            email,
            token,
            username,
            bio,
            image,
          }
        });
      }
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid user credentials'
    });
  }
}

export default AuthController;
