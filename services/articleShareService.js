import Mail from './Mail';

const articleShareService = (articleShareData) => {
  Mail.shareArticle(articleShareData);
};

export default articleShareService;
