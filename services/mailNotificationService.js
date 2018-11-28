import moment from 'moment';
import db from '../models';
import Mail from './Mail';
import logger from '../helpers/logger';
import Notification from '../controllers/user/Notification';
import SeriesHelper from '../helpers/SeriesHelper';

const {
  User, Article, Follows,
} = db;

/**
 *
 *
 * @class MailNotificationService
 */
class MailNotificationService {
  /**
   * Method to be triggered to send notification email when an article has a new comment
   * @param {object} eventInfo
   * @memberof MailNotificationService
   * @returns {null} Does not return
   */
  static async onArticleInteraction(eventInfo) {
    try {
      const {
        toUser,
        fromUser,
        articleId,
        type
      } = eventInfo;
      const toUserInfoPromise = User.findOne({ where: { id: toUser } });
      const fromUserInfoPromise = User.findOne({ where: { id: fromUser } });
      const articleInfoPromise = Article.findOne({ where: { id: articleId } });
      const [toUserInfo, fromUserInfo, articleInfo] = await Promise.all([
        toUserInfoPromise,
        fromUserInfoPromise,
        articleInfoPromise
      ]);
      const { username } = fromUserInfo;
      const {
        email, settings, username: authorUsername, firstName, lastName
      } = toUserInfo;
      const { title, slug } = articleInfo;
      const name = firstName || lastName || authorUsername;
      const info = {
        recipientEmail: email,
        fromUsername: username,
        articleTitle: title,
        articleSlug: slug,
        recipientName: name,
      };
      if (settings.emailSubscribe && type === 'comment') {
        await Mail.sendCommentNotification(info);
      }
      if (settings.emailSubscribe && type === 'like') {
        await Mail.sendLikeNotification(info);
      }

      const notificationInfo = MailNotificationService.getArticleInteractionNotificationInfo(
        fromUserInfo, toUserInfo, articleInfo, type
      );

      const shouldSendNotification = (settings.articleLike && type === 'like')
        || (settings.articleComment && type === 'comment');

      if (shouldSendNotification) {
        notificationInfo.message = `${username} ${type}d your Article: ${title}. Date: ${moment()
          .format('LLLL')} ago`;
        await Notification.create(notificationInfo);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   *
   * @param {User} fromUser - Model for the user who interacted on the article
   * @param {User} toUser - Model for the author of the article
   * @param {Article} article - Model for the article that was from
   * @param {string} type - The type of interaction
   * @return {object} Returns notification information to be stored in the database
   */
  static getArticleInteractionNotificationInfo(fromUser, toUser, article, type) {
    const { username, id: followsId, id: followsImage } = fromUser;
    const {
      title, slug, imageUrl, description
    } = article;
    const payload = {
      type,
      article: {
        title,
        slug,
        imageUrl,
        description
      },
      follower: {
        id: followsId,
        username,
        imageUrl: followsImage
      }
    };
    return {
      userId: toUser.id,
      payload,
      isRead: false,
      type: 'like'
    };
  }

  /**
   * Method to be triggered to send notification email when a user gets a new follower
   * @param {object} eventInfo
   * @memberof MailNotificationService
   * @returns {null} Does not return
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
      const { username, imageUrl: followersImage, id: followersId } = fromUserInfo;
      const {
        email, settings, username: toUsername, firstName, lastName
      } = toUserInfo;
      const recipientName = firstName || lastName || toUsername;
      const info = {
        recipientEmail: email,
        fromUsername: username,
        recipientName,
      };

      const payload = {
        type: 'follow',
        follower: {
          id: followersId,
          username,
          imageUrl: followersImage,
        }
      };
      const notificationInfo = {
        userId: toUserInfo.id, // ID of the user that is to receive the notification
        message: `${username} started following you ${moment()
          .format('LLLL')} ago`,
        type: 'follow',
        payload,
        isRead: false
      };
      let res;
      if (settings.newFollower) {
        res = await Notification.create(notificationInfo);
      }
      if (settings.emailSubscribe) {
        res = Mail.newFollowNotification(info);
      }
      return res;
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
   */
  static async onNewPostEvent(eventInfo) {
    try {
      const { authorId, articleId, seriesId } = eventInfo;
      const authorInfoPromise = User.findOne({ where: { id: authorId } });
      const articleInfoPromise = Article.findOne({ where: { id: articleId } });
      const authorsFollowersPromise = Follows.findAll({ where: { following: authorId } });
      const seriesPromise = SeriesHelper.getSeriesWithFollowers(seriesId);

      const [authorInfo, articleInfo, authorsFollowers, series] = await Promise.all([
        authorInfoPromise,
        articleInfoPromise,
        authorsFollowersPromise,
        seriesPromise
      ]);

      let followersIdArray = authorsFollowers.map(user => user.follower);
      if (series) {
        const seriesFollowersId = series.followers.map(user => user.id);
        followersIdArray = new Set([
          ...followersIdArray, ...seriesFollowersId
        ]); // to remove duplicate IDs
        followersIdArray = [...followersIdArray];
      }
      const users = await User.findAll({
        where: {
          id: followersIdArray,
          settings: {
            newArticleFromUserFollowing: 'true'
          }
        }
      });
      const recipients = users.map((user) => {
        const {
          email: recipientEmail, firstName, lastName, username
        } = user;
        const recipientName = firstName || lastName || username;
        return {
          recipientName,
          recipientEmail
        };
      });
      const { username } = authorInfo;
      const { title, slug } = articleInfo;
      const info = {
        recipients,
        author: username,
        articleTitle: title,
        articleSlug: slug
      };
      await MailNotificationService.createNotification(articleInfo, authorInfo, users);
      return Mail.followArticleNotification(info);
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   *
   * @param {Article} article
   * @param {User} author
   * @param {Array} users
   * @return {void} create notification entity for users follow the author of the article
   */
  static async createNotification(article, author, users) {
    const {
      username, imageUrl: authorsImage, id: authorId
    } = author;
    const {
      title, slug, id, imageUrl, description
    } = article;
    const notifications = users.map((user) => {
      const payload = {
        type: 'newArticle',
        article: {
          id,
          title,
          slug,
          imageUrl,
          description,
          author: {
            id: authorId,
            username,
            imageUrl: authorsImage
          }
        }
      };
      const notificationInfo = {
        userId: user.id,
        message: `${username} created a new Article: ${title} ${moment()
          .format('LLLL')} ago`,
        type: 'newArticle',
        payload,
        isRead: false,
      };
      return Notification.create(notificationInfo);
    });
    await Promise.all(notifications);
  }

  /**
   * Method to be triggered to send notification to the author when a user follows their series
   * @param {object} eventInfo
   * @memberof MailNotificationService
   * @returns {null} Does not return
   */
  static async onFollowSeriesEvent(eventInfo) {
    try {
      const { fromUser, slug } = eventInfo;
      const findSeriesPromise = SeriesHelper.findSeriesBySlug(slug);
      const fromUserInfoPromise = User.findOne({ where: { id: fromUser } });
      const [series, fromUserInfo] = await Promise.all([
        findSeriesPromise,
        fromUserInfoPromise
      ]);
      const { username, id: followersId, imageUrl } = fromUserInfo;
      const { email, settings, id } = series.user;
      const info = {
        recipientEmail: email, // author's email
        fromUsername: username
      };

      const payload = {
        type: 'followSeries',
        follower: {
          id: followersId,
          username,
          imageUrl,
        }
      };

      const notificationInfo = {
        userId: id, // ID of the user that will receive the notification
        message: `${username} started following your series: ${series.title} ${moment()
          .format('LLLL')} ago`,
        type: 'follow',
        payload,
        isRead: false
      };
      let res;
      if (settings.newFollowerOnSeries) {
        res = await Notification.create(notificationInfo);
      }
      if (settings.emailSubscribe) {
        res = Mail.newFollowSeriesNotification(info);
      }
      return res;
    } catch (error) {
      logger.error(error);
    }
  }
}


export default MailNotificationService;
