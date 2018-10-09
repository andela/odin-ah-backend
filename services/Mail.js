import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import MailHelper from '../helpers/MailHelper';
import emailMessages from './mailMessage';
import logger from '../helpers/logger';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @exports Mail
 * @class Mail
 * @description Handles the user verification mail sending
 *
 */
class Mail {
  /**
     * @static
     * @param {object} user
     * @return {json} Returns json object
     * @memberof Mail
     */
  static sendVerification(user) {
    const { email, token } = user;
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/auth/confirmation/${token}`;
    const subject = 'Confirmation Email';
    const { message } = emailMessages.signupVerification(email, url);
    const messageInfo = MailHelper.buildMessage(email, subject, message);
    sgMail
      .send(messageInfo)
      .then((resp) => {
        if (resp[0].statusCode === 202) {
          return logger.info(`VERIFICATION_EMAIL_SENT: ${email}`);
        }
        logger.log(`VERIFICATION_EMAIL_NOT_SENT: ${email}`);
      })
      .catch(err => logger.error(`SENDGRID_ERROR: ${err.stack}`));
  }

  /**
     *
     *
     * @static
     * @param {string} email
     * @param {string} url
     * @memberof Mail
     * @returns {res} response
     */
  static async sendPasswordReset(email, url) {
    const subject = 'Password Reset Email';
    const { message } = emailMessages.passwordReset(url);
    const messageInfo = MailHelper.buildMessage(email, subject, message);
    try {
      const response = await sgMail.send(messageInfo);
      if (response[0].statusCode === 202) {
        return {
          status: 'success',
        };
      }
      return {
        status: 'error',
        message: 'Unable to send email'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `An error occured: ${error}`,
      };
    }
  }
}

export default Mail;
