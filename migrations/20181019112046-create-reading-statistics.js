module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ReadingStatistics', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    authorId: {
      type: Sequelize.INTEGER
    },
    articleSlug: {
      type: Sequelize.STRING
    },
    readerId: {
      type: Sequelize.INTEGER
    },
    isUnique: {
      type: Sequelize.BOOLEAN
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
  down: queryInterface => queryInterface.dropTable('ReadingStatistics')
};
