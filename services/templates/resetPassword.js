import { formatter } from './util';
import { contentTemplate, emailTemplate, footerTemplate } from './index';

const getTemplate = ({ recipientName, resetLink, recipientEmail }) => {
  const context = {
    recipientName,
    recipientEmail,
    link: resetLink,
    message: 'We received a request to reset your Authors Haven password.',
    linkMessage: 'Click here to change your password',
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
