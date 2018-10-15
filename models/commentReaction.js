
module.exports = (sequelize, DataTypes) => {
  const CommentReaction = sequelize.define('CommentReaction', {
    reaction: {
      type: DataTypes.ENUM,
      values: ['like', 'dislike', 'neutral'],
    },
  }, {});
  CommentReaction.associate = (models) => {
    // associations can be defined here
    CommentReaction.belongsTo(models.Comment, { as: 'comment', foreignKey: 'commentId' });
    CommentReaction.belongsTo(models.User, { as: 'user' });
  };
  return CommentReaction;
};
