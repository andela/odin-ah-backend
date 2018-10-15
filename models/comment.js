module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    body: DataTypes.TEXT,
    type: DataTypes.INTEGER,
  }, {});
  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      as: 'user',
    });
    Comment.belongsTo(models.Article, {
      as: 'article',
    });
    Comment.belongsTo(models.Comment, {
      as: 'parent',
    });
    Comment.hasMany(models.Comment, { as: 'comments', foreignKey: 'parentId' });
    Comment.hasMany(models.CommentReaction, { as: 'reactions', foreignKey: 'commentId' });
  };
  return Comment;
};
