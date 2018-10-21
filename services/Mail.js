import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import MailHelper from '../helpers/MailHelper';
import mailMessages from './mailMessage';
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
  static async sendVerification(user) {
    const { email, token } = user;
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/auth/confirmation/${token}`;
    const subject = 'Confirmation Email';
    const { message } = mailMessages.signupVerification(email, url);
    const messageInfo = MailHelper.buildMessage(email, subject, message);
    return Mail.sendMail(messageInfo);
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
    const { message } = mailMessages.passwordReset(url);
    const messageInfo = MailHelper.buildMessage(email, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
   * Method to send notification when a new comment is made on an article
   * @static
   * @param {object} eventInfo
   * @return {json} Returns json object
   * @memberof Mail
   */
  static async sendCommentNotification(eventInfo) {
    const {
      recipientEmail, fromUsername, articleTitle, articleSlug
    } = eventInfo;
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/articles/${articleSlug}`;
    const subject = 'New Comment Notification';
    const { message } = mailMessages.sendCommentNotification(
      recipientEmail,
      fromUsername,
      articleTitle,
      url
    );
    const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
   * Method to send notification when a new comment is made on an article
   * @static
   * @param {object} eventInfo
   * @return {json} Returns json object
   * @memberof Mail
   */
  static async sendLikeNotification(eventInfo) {
    const {
      recipientEmail, fromUsername, articleTitle, articleSlug
    } = eventInfo;
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/articles/${articleSlug}`;
    const subject = 'New Like Notification';
    const { message } = mailMessages.sendLikeNotification(
      recipientEmail,
      fromUsername,
      articleTitle,
      url
    );
    const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
   * Method to send notification when user has a new follower
   * @static
   * @param {object} eventInfo
   * @return {json} Returns json object
   * @memberof Mail
   */
  static async newFollowNotification(eventInfo) {
    const { recipientEmail, fromUsername } = eventInfo;
    const subject = 'New Follow Notification';
    const { message } = mailMessages.newFollowNotification(recipientEmail, fromUsername);
    const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
     * Method to send notification when user has a new follower
     * @static
     * @param {object} eventInfo
     * @return {json} Returns json object
     * @memberof Mail
     */
  static async newFollowSeriesNotification(eventInfo) {
    const {
      recipientEmail,
      fromUsername
    } = eventInfo;
    const subject = 'New Follow Notification';
    const { message } = mailMessages
      .newFollowSeriesNotification(recipientEmail, fromUsername);
    const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
   * Method to send notification when user has a new follower
   * @static
   * @param {object} eventInfo
   * @return {json} Returns json object
   * @memberof Mail
   */
  static async followArticleNotification(eventInfo) {
    const {
      recipientsEmail, fromUsername, articleTitle, articleSlug
    } = eventInfo;
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/articles/${articleSlug}`;
    const subject = 'New Post Notification';
    const messagesInfo = recipientsEmail.map(async (email) => {
      const { message } = mailMessages.followArticleNotification(
        email,
        fromUsername,
        articleTitle,
        url
      );
      const messageInfo = MailHelper.buildMessage(email, subject, message);
      return Mail.sendMail(messageInfo);
    });
    return Promise.all(messagesInfo);
  }

  /**
   * Method to complete article sharing by email
   * @static
   * @param {object} articleShareData
   * @return {json} Returns json object
   * @memberof Mail
   */
  static async shareArticle(articleShareData) {
    try {
      const {
        article: { slug, title },
        recipient,
        sender: { username }
      } = articleShareData;
      const baseUrl = process.env.BASE_URL;
      const url = `${baseUrl}/articles/${slug}`;
      const subject = title;
      const { message } = mailMessages.newArticleShare(username, url, title);
      const messageInfo = MailHelper.buildMessage(recipient, subject, message);
      const result = await Mail.sendMail(messageInfo);
      logger.info(result);
      return result;
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   *
   * @param {object} messageInfo
   * @return {Promise<*>} Sends the mail.
   */
  static async sendMail(messageInfo) {
    try {
      const response = await sgMail.send(messageInfo);
      if (response[0].statusCode === 202) {
        return {
          status: 'success'
        };
      }
      return {
        status: 'error',
        message: 'Unable to send email'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `An error occurred: ${error}`
      };
    }
  }
}

export default Mail;
