
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('CommentReactions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    reaction: {
      type: Sequelize.ENUM,
      values: ['like', 'dislike', 'neutral'],
    },
    commentId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Comments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        id: 'id',
        model: 'Users'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('CommentReactions')
};
