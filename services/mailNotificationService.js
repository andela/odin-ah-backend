import moment from 'moment';
import db from '../models';
import Mail from './Mail';
import logger from '../helpers/logger';
import Notification from '../controllers/user/Notification';
import asyncCatchErrors from '../middlewares/asyncCatchErrors';

const { User, Article, Follows } = db;

/**
 *
 *
 * @class MailNotificationService
 */
class MailNotificationService {
  /**
     * Method to be triggered to send notification email when an article has a new comment or like
     * @param {object} eventInfo
     * @memberof MailNotificationService
     * @returns {null} Does not return
     * @param {next} next
     */
  static async onArticleInteraction(eventInfo) {
    try {
      const { toUser, fromUser, articleId } = eventInfo;
      const toUserInfoPromise = User.findOne({ where: { id: toUser } });
      const fromUserInfoPromise = User.findOne({ where: { id: fromUser } });
      const articleInfoPromise = Article.findOne({ where: { id: articleId } });
      const [toUserInfo, fromUserInfo, articleInfo] = await Promise.all([
        toUserInfoPromise,
        fromUserInfoPromise,
        articleInfoPromise
      ]);
      const { username } = fromUserInfo;
      const { email, settings } = toUserInfo;
      const { title, slug } = articleInfo;
      const info = {
        recipientEmail: email,
        fromUsername: username,
        articleTitle: title,
        articleSlug: slug
      };
      const notificationInfo = {
        userId: toUserInfo.id,
        message: `${username} commented on your Article: ${title} ${moment().format('LLLL')} ago`,
        isRead: false,
      };
      if (settings.emailSubcribe) {
        await Promise.all([Mail.sendCommentNotification(info), Mail.sendLikeNotification(info)]);
      }
      if (settings.articleComment || settings.articleLike) {
        await asyncCatchErrors(Notification.create(notificationInfo));
      }
    } catch (error) {
      logger.error(error);
    }
  }

  /**
     * Method to be triggered to send notification email a user gets a new follower
     * @param {object} eventInfo
     * @memberof MailNotificationService
     * @returns {null} Does not return
     * @param {next} next
     */
  static async onFollowEvent(eventInfo) {
    try {
      const { toUser, fromUser } = eventInfo;
      const toUserInfoPromise = User.findOne({ where: { id: toUser } });
      const fromUserInfoPromise = User.findOne({ where: { id: fromUser } });
      const [toUserInfo, fromUserInfo] = await Promise.all([
        toUserInfoPromise,
        fromUserInfoPromise
      ]);
      const { username } = fromUserInfo;
      const { email, settings } = toUserInfo;
      const info = {
        recipientEmail: email,
        fromUsername: username
      };
      const notificationInfo = {
        userId: fromUserInfo.id,
        message: `${toUserInfo.username} started following you ${moment().format('LLLL')} ago`,
        isRead: false
      };
      if (settings.newFollower) {
        await asyncCatchErrors(Notification.create(notificationInfo));
      }
      if (settings.emailSubcribe) {
        return Mail.newFollowNotification(info);
      }
      return null;
    } catch (error) {
      logger.error(error);
    }
  }

  /**
     * Method to be triggered to send a notification email
     * when a user I follow publish a new article
     * @param {object} eventInfo
     * @memberof MailNotificationService
     * @returns {null} Does not return
     * @param {next} next
     */
  static async onNewPostEvent(eventInfo) {
    try {
      const { authorId, articleId } = eventInfo;
      const authorInfoPromise = User.findOne({ where: { id: authorId } });
      const articleInfoPromise = Article.findOne({ where: { id: articleId } });
      const authorsFollowersPromise = Follows.findAll({ where: { following: authorId } });

      const [authorInfo, articleInfo, authorsFollowers] = await Promise.all([
        authorInfoPromise,
        articleInfoPromise,
        authorsFollowersPromise
      ]);

      const followersIdArray = authorsFollowers.map(user => user.follower);
      const users = await User.findAll({
        where: {
          id: followersIdArray,
          settings: {
            newArticleFromUserFollowing: 'true'
          }
        }
      });
      const recipientsEmail = users.map(user => user.email);
      const { username } = authorInfo;
      const { title, slug } = articleInfo;
      const info = {
        recipientsEmail,
        fromUsername: username,
        articleTitle: title,
        articleSlug: slug
      };
      users.forEach(async (user) => {
        const notificationInfo = {
          userId: user.id,
          message: `${username} created a new Airticle: ${title} ${moment().format('LLLL')} ago`,
          isRead: false,
        };
        asyncCatchErrors(Notification.create(notificationInfo));
      });
      await Mail.followArticleNotification(info);
    } catch (error) {
      logger.error(error);
    }
  }
}

const mailNotificationService = new MailNotificationService();

export { mailNotificationService, MailNotificationService };
