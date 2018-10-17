import moment from 'moment';
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
        this.message;
        this.userId;
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
        const { page, limit, offset } = pageInfo;
        let userNotification = await Notifications.findAll({
            limit,
            offset,
            where: { userId }
        });

        if (userNotification.length === 0) {
            return res.status(200).json({ status: 'success', message: 'You do not have any notification yet' });
        }
        userNotification = userNotification.map((notification) => {
            const {
                id,
                isRead,
                message,
                createdAt,
                updatedAt
            } = notification;
            const currentTime = moment(Date.now());
            if (isRead && moment(updatedAt).diff(currentTime, 'days')) {
                Notifications.destroy({ where: { id } });
            }
            return {
                id,
                isRead,
                message,
                createdAt
            };
        });
        return res.status(200).json({ status: 'success', userNotification, page });
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
            where: { userId, id: notificationId }
        });
        if (response) {
            return res.status(200).json({ status: 'success', message: 'notification have been updated' });
        }
        HttpError.throwErrorIfNull(response, 'notification does not exist');
    }

    /**
     *
     * @param {object} info - Data to be stored in the Notification table
     * @return {object} returns response data.
     */
    async create(info) {
        const { userId, message, isRead } = info;
        this.message = message;
        this.userId = userId;
        await Notifications.create({ userId, message, isRead });
    }

    /**
     * Notify the user on real time
     * @param {object} Socket - socket instance
     * @return {object} returns response data.
     */
    notify(Socket) {
        Socket.emit(`notification-${this.userId}`, { message: this.message });
    }
}
const notification = new Notification();
export default notification;