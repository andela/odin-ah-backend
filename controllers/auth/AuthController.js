import bcrypt from 'bcrypt';
import Authorization from '../../middlewares/Authorization';
import UserHelper from '../../helpers/UserHelper';
import verificationToken from '../../helpers/verificationToken';
import db from '../../models/index';
import Mail from '../../services/Mail';

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
   * @return {json} Returns json object
   * @static
   */
  static async login(req, res) {
    const { email, password } = req.body;
    const foundUser = await UserHelper.findByEmail(email);
    if (foundUser) {
      const validPassword = await bcrypt.compare(password, foundUser.dataValues.password);
      if (validPassword) {
        const {
          id, username, bio, imageUrl
        } = foundUser.dataValues;
        const token = Authorization.generateToken(id);
        return res.status(200).json({
          user: {
            email,
            token,
            username,
            bio,
            imageUrl
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
        $or: [{ email }, { username }]
      }
    })
      .then((user) => {
        if (user) {
          return res.status(400).json({
            status: 'error',
            message: 'Account already exist'
          });
        }
        const token = verificationToken();
        User.create({
          username,
          email,
          password,
          token
        })
          .then((newUser) => {
            if (newUser) {
              req.message = 'Please check your Email for account confirmation';
              req.user = newUser;
            }
            Mail.sendVerification(req, res, next);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
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
    })
      .then((tokenFound) => {
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

  /**
   * Generates JWT for user after successful social login
   * @async
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - next middleware
   * @return {json} Returns json object
   * @static
   */
  static serializeUser(req, res) {
    if (req.user.hasNoEmail) {
      return res.status(422).json({
        errors: {
          message:
            'Your social account does not have an email associated. Please sign up with email'
        }
      });
    }
    const {
      id, email, username, bio, imageUrl
    } = req.user;
    const token = Authorization.generateToken(id);
    res.status(200).json({
      user: {
        email,
        token,
        username,
        bio,
        imageUrl
      }
    });
  }

  /**
   * Generates JWT for user after successful social login
   * @async
   * @param  {string} accessToken - accessToken
   * @param {string} otherToken - refreshToken or tokenSecret
   * @param {object} profile - user profile
   * @param {function} done - verify callback
   * @return {object} null - Returns doesn't return
   * @static
   */
  static async strategyCallback(accessToken, otherToken, profile, done) {
    if (!profile.emails) {
      const userWithNoEmail = { hasNoEmail: true };
      return done(null, userWithNoEmail);
    }
    const email = profile.emails[0].value;
    const imageUrl = profile.photos ? profile.photos[0].value : null;
    let firstName = null,
      lastName = null;
    if (profile.displayName) {
      const names = profile.displayName.split(' ');
      [firstName] = names;
      lastName = names[names.length - 1];
    }
    try {
      const user = await User.findOrCreate({
        where: { email },
        defaults: { imageUrl, firstName, lastName }
      });
      done(null, user[0]);
    } catch (err) {
      done(err, null);
    }
  }
}

export default AuthController;
