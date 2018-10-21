module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('FollowSeries', {
    seriesId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      reference: {
        model: 'Series',
        key: 'id',
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: Sequelize.ENUM,
      values: ['FOLLOW', 'UNFOLLOW'],
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
  down: queryInterface => queryInterface.dropTable('FollowSeries')
};
