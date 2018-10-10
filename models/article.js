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

    Article.hasMany(models.Comment, {
      as: 'comments',
      foreignKey: 'articleId'
    });

    Article.hasMany(models.Like, {
      foreignKey: 'articleId',
      as: 'likes',
    });

    Article.belongsToMany(models.Tag, {
      as: 'tags',
      through: 'ArticleTags',
      foreignKey: 'articleId'
    });
  };

  return Article;
};
