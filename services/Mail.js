import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import MailHelper from '../helpers/MailHelper';
import mailMessages from './mailMessage';
import logger from '../helpers/logger';
import resetPassword from './templates/resetPassword';
import emailConfirmation from './templates/emailComfirmation';
import interaction from './templates/interaction';
import followTemplate from './templates/follow';
import articleTemplate from './templates/article';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const baseUrl = process.env.BASE_FRONTEND_URL;

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
    const {
      email: recipientEmail, firstName, lastName, username, token
    } = user;

    const recipientName = firstName || lastName || username;

    const confirmationLink = `${baseUrl}/auth/confirmation/${token}`;
    const subject = 'Confirmation Email';
    const message = emailConfirmation({
      recipientEmail,
      recipientName,
      confirmationLink
    });
    const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
    return Mail.sendMail(messageInfo);
  }

  /**
   *
   *
   * @static
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @param {string} resetToken
   * @memberof Mail
   * @returns {res} response
   */
  static async sendPasswordReset(recipientEmail, recipientName, resetToken) {
    const subject = 'Password Reset Email';
    const resetLink = `${baseUrl}/reset-password/complete/${resetToken}`;
    const message = resetPassword({
      recipientName,
      resetLink,
      recipientEmail,
    });
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
  static async sendCommentNotification(eventInfo) {
    const {
      recipientEmail, recipientName, fromUsername, articleTitle, articleSlug
    } = eventInfo;
    const url = `${baseUrl}/articles/${articleSlug}`;
    const subject = 'New Comment Notification';
    const message = interaction({
      recipientEmail,
      recipientName,
      follower: fromUsername,
      title: articleTitle,
      link: url,
      action: 'commented'
    });
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
      recipientEmail, recipientName, fromUsername, articleTitle, articleSlug
    } = eventInfo;
    const url = `${baseUrl}/articles/${articleSlug}`;
    const subject = 'New Like Notification';
    const message = interaction({
      recipientEmail,
      follower: fromUsername,
      title: articleTitle,
      link: url,
      action: 'liked',
      recipientName
    });
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
    const { recipientEmail, recipientName, fromUsername } = eventInfo;
    const subject = 'New Follow Notification';
    const link = `${baseUrl}/profile/${fromUsername}`;
    const message = followTemplate({
      recipientEmail,
      recipientName,
      follower: fromUsername,
      link
    });
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
      recipients, author, articleTitle, articleSlug
    } = eventInfo;
    const link = `${baseUrl}/article/${articleSlug}`;
    const subject = 'New Post Notification';
    const messagesInfo = recipients.map(async (user) => {
      const { recipientEmail, recipientName } = user;
      const message = articleTemplate(
        {
          recipientEmail,
          recipientName,
          author,
          articleTitle,
          link
        }
      );
      const messageInfo = MailHelper.buildMessage(recipientEmail, subject, message);
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
