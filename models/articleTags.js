module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('ArticleTag', {
    articleId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {});
  Article.associate = () => {

  };

  return Article;
};
