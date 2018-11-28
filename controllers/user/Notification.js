import db from '../../models/index';
import Util from '../../helpers/Util';
import HttpError from '../../helpers/exceptionHandler/httpError';

const { Notifications } = db;

/**
 * @exports Notification
 * @class Notification
 * @description Handles all notifications in the application
 * */
class Notification {
  /* eslint-disable */

  constructor() {
    this.io = null;
  }


  /**
   * get all the notification of a user
   * @async
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @return {json} Returns json object
   * @static
   */
  async getNotification(req, res) {
    const { userId } = req.authData;
    const total = await Notifications.count({ where: { userId } });
    const pageInfo = Util.getPageInfo(req.query.page, req.query.size, total);
    const { page, limit, offset, totalPages } = pageInfo;
    let notifications = await Notifications.findAll({
      limit,
      offset,
      where: { userId },
      order: [
        ['createdAt', 'DESC']
      ]
    });
    notifications = notifications.map((notification) => {
      const {
        id,
        isRead,
        message,
        payload,
        createdAt,
      } = notification;
      return {
        id,
        isRead,
        message,
        payload,
        createdAt
      };
    });
    return res.status(200)
      .json({
        status: 'success',
        notifications,
        page,
        totalPages,
        size: notifications.length,
        total,
      });
  }

  /**
   * Update notification when it has been read
   * @async
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @return {json} Returns json object
   * @static
   */
  async updateNotification(req, res) {
    const { notificationId } = req.params;
    const { userId } = req.authData;
    const [response] = await Notifications.update({ isRead: true }, {
      where: {
        userId,
        id: notificationId
      }
    });
    HttpError.throwErrorIfNull(response, 'notification does not exist');
    res.status(200)
      .json({
        status: 'success',
        message: 'notification have been updated'
      });
  }

  /**
   *
   * @param {object} info - Data to be stored in the Notification table
   * @return {object} returns response data.
   */
  async create(info) {
    const { userId, message, type, isRead, payload } = info;
    await Notifications.create({
      userId,
      message,
      isRead,
      payload,
    });
    if (this.io) {
      this.io.emit(`notification-${userId}`, {
        message,
        type
      });
    }
  }

  /**
   * Notify the user on real time
   * @param {object} io - socket instance
   * @return {object} returns response data.
   */
  notify(io) {
    this.io = io;
  }
}

const notification = new Notification();
export default notification;
