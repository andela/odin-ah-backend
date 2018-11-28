import { formatter } from './util';
import { contentTemplate, emailTemplate, footerTemplate } from './index';

const getTemplate = ({
  recipientName, follower, action, title, link, recipientEmail
}) => {
  const context = {
    recipientName,
    recipientEmail,
    link,
    message: `@${follower} just ${action} on your article: ${title}`,
    linkMessage: 'Click here to view article',
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
