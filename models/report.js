
module.exports = (sequelize, Sequelize) => sequelize.define('Report', {
  userId: Sequelize.INTEGER,
  articleId: Sequelize.INTEGER,
  reportType: {
    type: Sequelize.ENUM,
    values: ['plagiarism', 'spam', 'harassment', 'others'],
  },
  description: Sequelize.TEXT,

}, {});
