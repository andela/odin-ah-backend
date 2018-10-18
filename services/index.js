import eventBus from '../helpers/eventBus';
import MailNotificationService from './mailNotificationService';

const initServices = () => {
  eventBus.on('onArticleInteraction', MailNotificationService.onArticleInteraction);
  eventBus.on('onFollowEvent', MailNotificationService.onFollowEvent);
  eventBus.on('onNewPostEvent', MailNotificationService.onNewPostEvent);
};

export default initServices;
