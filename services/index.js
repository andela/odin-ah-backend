import eventBus from '../helpers/eventBus';
import MailNotificationService from './mailNotificationService';
import ReadingStats from './ReadingStats';

const initServices = () => {
  eventBus.on('onArticleInteraction', MailNotificationService.onArticleInteraction);
  eventBus.on('onFollowEvent', MailNotificationService.onFollowEvent);
  eventBus.on('onNewPostEvent', MailNotificationService.onNewPostEvent);
  eventBus.on('onNewArticleView', ReadingStats.articleViewHandler);
};

export default initServices;
