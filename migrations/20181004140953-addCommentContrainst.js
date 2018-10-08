module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Comments',
    'userId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }
  ).then(() => queryInterface.addColumn(
    'Comments',
    'articleId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'Articles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }
  )).then(() => queryInterface.addColumn(
    'Comments',
    'parentId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'Comments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }
  )),

  down: queryInterface => queryInterface.removeColumn('Comments', 'userId')
    .then(() => queryInterface.removeColumn('Comments', 'articleId'))
};
