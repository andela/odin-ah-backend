module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    slug: DataTypes.STRING,
    body: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {});
  Article.associate = (models) => {
    Article.belongsTo(models.User, {
      as: 'user',
    });
  };

  return Article;
};
