module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Likes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    articleId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        id: 'id',
        model: 'Articles'
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        id: 'id',
        model: 'Users'
      }
    },
    status: {
      type: Sequelize.ENUM,
      values: ['like', 'dislike', 'neutral'],
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
  }),
  down: queryInterface => queryInterface.dropTable('Likes')
};
