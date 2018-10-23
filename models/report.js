
module.exports = (sequelize, Sequelize) => {
  const Report = sequelize.define('Report', {
    userId: Sequelize.INTEGER,
    articleId: Sequelize.INTEGER,
    reportType: {
      type: Sequelize.ENUM,
      values: ['plagiarism', 'spam', 'harassment', 'others'],
    },
    description: Sequelize.TEXT,

  }, {});
  Report.associate = () => {
  };
  return Report;
};
