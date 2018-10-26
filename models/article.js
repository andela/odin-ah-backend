module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    'Article',
    {
      slug: DataTypes.STRING,
      body: DataTypes.TEXT,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      readingTime: DataTypes.STRING,
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    },
    {}
  );
  Article.hook('beforeCreate', (article) => {
    const wordLength = article.body.split(' ').length,
      minute = wordLength / 200;
    article.readingTime = Math.ceil(minute * 60 * 1000);
  });
  Article.hook('beforeUpdate', (article) => {
    const wordLength = article.body.split(' ').length,
      minute = wordLength / 200;
    article.readingTime = Math.ceil(minute * 60 * 1000);
  });
  Article.associate = (models) => {
    Article.belongsTo(models.User, { as: 'user' });

    Article.belongsTo(models.Series, { as: 'series' });

    Article.hasMany(models.Comment, {
      as: 'comments',
      foreignKey: 'articleId'
    });

    Article.hasMany(models.Like, {
      foreignKey: 'articleId',
      as: 'likes'
    });

    Article.belongsToMany(models.Tag, {
      as: 'tags',
      through: 'ArticleTags',
      foreignKey: 'articleId'
    });

    Article.hasMany(models.Bookmark, {
      as: 'bookmarks',
      foreignKey: 'articleId'
    });
  };

  return Article;
};
