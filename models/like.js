
module.exports = (sequelize, Sequelize) => {
  const Like = sequelize.define('Like', {
    articleId: Sequelize.INTEGER,
    userId: Sequelize.INTEGER,
    status: {
      type: Sequelize.ENUM,
      values: ['like', 'dislike', 'neutral'],
    },

  }, {});
  Like.associate = (models) => {
    Like.belongsTo(models.Article, {
      foreignKey: 'articleId',
      onDelete: 'CASCADE',
    });
  };
  return Like;
};
