import dotenv from 'dotenv';

dotenv.config();

/**
 * @class MailHelper
 */
class MailHelper {
  /**
   *
   *
   * @static
   * @param {string} to
   * @param {string} subject
   * @param {string} message
   * @returns {object} returns an object containing message info
   * @memberof MailHelper
   */
  static buildMessage(to, subject, message) {
    return {
      to,
      from: process.env.HOST_EMAIL,
      subject,
      html: message
    };
  }
}

export default MailHelper;
