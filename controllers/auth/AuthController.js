import bcrypt from 'bcrypt';
import Authorization from '../../middlewares/Authorization';
import UserHelper from '../../helpers/UserHelper';
import oneToken from '../../helpers/oneToken';
import db from '../../models/index';


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

  /**
   * Create user account and call the next function for email verification
   * @static
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @return {json} Returns json object
   * @memberof AuthController
   */
  static signUp(req, res, next) {
    const { username, email, password } = req.body;
    User.findOne({
      where: {
        email: {
          $iLike: email
        }
      }
    })
      .then((foundUser) => {
        if (foundUser) {
          return res.status(400).json({
            status: 'failed',
            message: `user with email ${email} already have Authors haven account`,
          });
        }
      });

    const token = oneToken();
    User.create({
      username,
      email,
      password,
      token
    }).then((userCreated) => {
      if (userCreated) {
        req.message = 'Please check your Email for account confirmation';
        req.user = userCreated;
      }
      return next();
    }).catch(err => next(err));
  }

  /**
   *
   * @static
   * @param {object} req
   * @param {object} res
   *  @param {function} next
   * @memberof AuthController
   * @return {json} Returns json object
   */
  static verifyUser(req, res, next) {
    User.findOne({
      where: { token: req.params.token }
    }).then((tokenFound) => {
      if (!tokenFound) {
        return res.status(400).send({
          status: 'error',
          message: 'invalid verification link'
        });
      }
      return tokenFound.update({ isVerified: true, token: null });
    })
      .then(() => res.status(200).send({ message: 'User verified' }))
      .catch(err => next(err));
  }
}

export default AuthController;
