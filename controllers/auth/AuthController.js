import bcrypt from 'bcrypt';
import validator from 'validator';
import Authorization from '../../middlewares/Authorization';
import UserHelper from '../../helpers/UserHelper';
import db from '../../models/index';
import Mail from '../../services/Mail';
import eventBus from '../../helpers/eventBus';
import HttpError from '../../helpers/exceptionHandler/httpError';
import Util from '../../helpers/Util';

const { User } = db;

/**
 * @exports AuthController
 * @class AuthController
 * @description Handles the user registration and sign in
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
    const user = await UserHelper.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid user credentials'
      });
    }
    const isValidPassword = await bcrypt.compare(password, user.dataValues.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid user credentials'
      });
    }
    const {
      username,
      bio,
      imageUrl,
      isVerified,
    } = user.dataValues;
    if (!isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Your email is not yet verified. Please check your email for further instructions.'
      });
    }
    const token = Authorization.generateToken(user.dataValues);
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

  /**
     * Create user account and call the next function for email verification
     * @static
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @return {json} Returns json object
     * @memberof AuthController
     */
  static async signUp(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await User.findOne({
        where: {
          $or: [{ email }, { username }]
        }
      });
      if (user) {
        return next(new HttpError('User already exists. Please login', 400));
      }
      const token = Util.generateRandomString(32);
      const newUser = await User.create({
        username,
        email,
        password,
        token
      });
      eventBus.on('resendEmail', Mail.sendVerification);
      eventBus.emit('resendEmail', newUser);
      res.status(201).json({
        status: 'success',
        message: 'Please check your Email for account confirmation'
      });
    } catch (error) {
      next(error);
    }
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
  static async verifyUser(req, res, next) {
    try {
      const unverifiedUser = await User.findOne({
        where: { token: req.params.token }
      });
      if (!unverifiedUser) {
        return res.status(400).send({
          status: 'error',
          message: 'invalid verification link'
        });
      }
      await unverifiedUser.update({ isVerified: true, token: null });
      res.status(200).send({ message: 'User verified' });
    } catch (error) {
      next(error);
    }
  }

  /**
     * Generates JWT for user after successful social login
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static serializeUser(req, res) {
    if (req.user.hasNoEmail) {
      return res.status(422).json({
        errors: {
          message: 'Your social account does not have an email associated. Please sign up with email'
        }
      });
    }
    const {
      id,
      email,
      username,
      bio,
      imageUrl
    } = req.user;
    const token = Authorization.generateToken({ id, role: 'user' });
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

  /**
     * Resends verification link to user email
     * @async
     * @param  {object} req - Request object
     * @param {object} res - Response object
     * @return {json} Returns json object
     * @static
     */
  static async resendVerificationLink(req, res) {
    const { email } = req.body;
    const emailIsValid = validator.isEmail(email);
    if (!emailIsValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'You have not created an account yet.'
      });
    }
    if (user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is already verified'
      });
    }
    eventBus.on('resendEmail', Mail.sendVerification);
    eventBus.emit('resendEmail', user);
    res.status(200).json({
      status: 'success',
      message: 'Confirmation link has been sent. Please check your email or spam folder'
    });
  }
}

export default AuthController;
