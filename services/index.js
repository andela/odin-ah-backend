import eventBus from '../helpers/eventBus';
import MailNotificationService from './mailNotificationService';
import ReadingStats from './ReadingStats';
import articleShareService from './articleShareService';

const initServices = () => {
  eventBus.on('onArticleInteraction', MailNotificationService.onArticleInteraction);
  eventBus.on('onFollowEvent', MailNotificationService.onFollowEvent);
  eventBus.on('onNewPostEvent', MailNotificationService.onNewPostEvent);
  eventBus.on('onFollowSeriesEvent', MailNotificationService.onFollowSeriesEvent);
  eventBus.on('onNewArticleView', ReadingStats.articleViewHandler);
  eventBus.on('articleShare', articleShareService);
};

export default initServices;
