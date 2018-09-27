import bcrypt from 'bcrypt';
import db from '../models';
import Authorization from '../middlewares/Authorization';

const { User } = db;
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
  static async login(req, res, next) {
    const { email, password } = req.body;
    try {
      User.findOne({ where: { email } }).then(async (foundUser) => {
        if (!foundUser) {
          return res.status(401).json({
            status: 'error',
            message: 'Invalid user credentials'
          });
        }
        const ValidPassword = await bcrypt.compare(password, foundUser.dataValues.password);
        if (!ValidPassword) {
          return res.status(401).json({
            status: 'error',
            message: 'Invalid user credentials'
          });
        }
        const userDetails = foundUser.dataValues;
        const token = Authorization.generateToken(userDetails.id);
        return res.status(200).json({
          status: 'success',
          message: 'Login Successful',
          user: {
            email: userDetails.email,
            token,
            username: userDetails.username,
            bio: userDetails.bio,
            image: userDetails.image,
          }
        });
      });
    } catch (error) {

    }
  }
}

export default AuthController;
