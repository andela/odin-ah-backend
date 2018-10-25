import moment from 'moment';
import db from '../models';
import logger from '../helpers/logger';

const { Notifications } = db;

const NotificationExpiryDate = moment().subtract(1, 'w').format('YYYY-MM-DD');
const deleteReadNotifications = async () => {
  try {
    const deleted = await Notifications.destroy(
      {
        where: {
          isRead: true,
          updatedAt: {
            $lte: NotificationExpiryDate,
          }
        }
      }
    );
    return {
      deleted
    };
  } catch (error) {
    logger.error(error);
  }
};

export default deleteReadNotifications;
