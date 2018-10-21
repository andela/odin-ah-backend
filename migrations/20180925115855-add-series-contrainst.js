module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Series',
    'userId',
    {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Series', 'userId')
};
