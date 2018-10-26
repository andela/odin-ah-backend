module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Articles',
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
  )
    .then(() => queryInterface.addColumn(
      'Articles',
      'seriesId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Series',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    )),

  down: queryInterface => queryInterface.removeColumn('Articles', 'userId')
    .then(() => queryInterface.removeColumn('Articles', 'seriesId'))
};
