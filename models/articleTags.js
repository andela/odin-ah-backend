module.exports = (sequelize, DataTypes) => sequelize.define('ArticleTag', {
  articleId: DataTypes.INTEGER,
  tagId: DataTypes.INTEGER
}, {});
