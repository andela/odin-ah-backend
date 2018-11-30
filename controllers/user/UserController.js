import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../../helpers/logger';
import db from '../../models/index';
import UserHelper from '../../helpers/UserHelper';
import Util from '../../helpers/Util';
import Mailer from '../../services/Mail';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { User } = db;
/**
 * UserController
 */
export default class UserController {
  /**
   *
   *
   * @static
   * @param {request} req
   * @param {response} res
   * @param {next} next
   * @returns {json} return json object to user
   * @memberof UserController
   */
  static async beginResetPassword(req, res, next) {
    const { email } = req.body;
    try {
      const user = await UserHelper.findByEmail(email);
      HttpError.throwErrorIfNull(user, 'Oops! user not found');

      const {
        id, updatedAt, firstName, lastName, username
      } = user;
      const name = firstName || lastName || username;
      const resetToken = Util.generateToken({ id, updatedAt },
        Util.dateToString(updatedAt));
      Mailer.sendPasswordReset(email, name, resetToken)
        .then(({ status, message }) => {
          if (status !== 'success') {
            logger.error(message);
          }
        })
        .catch((error) => {
          logger.error(error);
        });
      return res.status(200)
        .json({
          status: 'success',
          message: 'An email containing the reset password link has been sent to you. If you can\'t find the link, please try again.'
        });
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {object} req
   * @param {object} res
   * @returns {object} a response object
   * @memberof UserController
   */
  static async completePasswordReset(req, res) {
    const { token } = req.params;
    const { password } = req.body;
    try {
      const { id } = await jwt.decode(token);
      const user = await User.findById(id);
      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Oops! user not found'
        });
      }
      const { updatedAt } = user;
      await jwt.verify(token, Util.dateToString(updatedAt));
      await user.update(
        {
          password: bcrypt.hashSync(password, 10),
        },
        {
          where: {
            id
          }
        }
      );
      return res.status(200).json({
        status: 'success',
        message: 'Password has been successfully reset!',
      });
    } catch (error) {
      const message = (error instanceof jwt.JsonWebTokenError) ? 'Invalid password reset token' : error.message;
      res.status(400).json({
        status: 'error',
        message
      });
    }
  }
}
