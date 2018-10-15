
module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER
  }, {});
  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, {
      as: 'user',
    });
    Bookmark.belongsTo(models.Article, {
      as: 'article',
      foreignKey: 'articleId'
    });
  };
  return Bookmark;
};
