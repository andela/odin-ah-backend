import { formatter } from './util';
import { contentTemplate, emailTemplate, footerTemplate } from './index';

const getTemplate = ({
  recipientName, follower, link, recipientEmail
}) => {
  const context = {
    recipientName,
    recipientEmail,
    follower,
    link,
    message: `@${follower} stated following your.`,
    linkMessage: 'Click here to view their profile',
  };
  const content = formatter(contentTemplate, context);
  const footer = formatter(footerTemplate, context);
  return formatter(emailTemplate, {
    ...context,
    footer,
    content
  });
};
export default getTemplate;
