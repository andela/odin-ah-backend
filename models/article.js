module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    slug: DataTypes.STRING,
    body: DataTypes.TEXT,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    disabled: DataTypes.BOOLEAN,
    readingTime: DataTypes.STRING
  }, {});
  Article.hook('beforeCreate', (article) => {
    const wordLength = (article.body).split(' ').length,
      minute = wordLength / 200;
    article.readingTime = minute * 60 * 1000;
  });
  Article.hook('beforeUpdate', (article) => {
    const wordLength = (article.body).split(' ').length,
      minute = wordLength / 200;
    article.readingTime = minute * 60 * 1000;
  });
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
    Article.hasMany(models.Bookmark, { as: 'bookmarks', foreignKey: 'articleId' });
  };

  return Article;
};
