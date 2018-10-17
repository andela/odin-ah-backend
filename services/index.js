import eventBus from '../helpers/eventBus';
import { MailNotificationService } from './mailNotificationService';
import asyncCatchErrors from '../middlewares/asyncCatchErrors';

const initServices = () => {
  eventBus.on('onArticleInteractionEvent', asyncCatchErrors(MailNotificationService.onArticleInteraction));
  eventBus.on('onFollowEvent', asyncCatchErrors(MailNotificationService.onFollowEvent));
  eventBus.on('onNewPostEvent', asyncCatchErrors(MailNotificationService.onNewPostEvent));
};

export default initServices;
