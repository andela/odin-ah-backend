import { formatter } from './util';
import { contentTemplate, emailTemplate, footerTemplate } from './index';

const getTemplate = ({
  recipientName, articleTitle, author, link, recipientEmail
}) => {
  const context = {
    recipientName,
    recipientEmail,
    link,
    message: `@${author} just published a new article: ${articleTitle}`,
    linkMessage: 'Click here view article',
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
