module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Notifications',
    'payload',
    {
      type: Sequelize.JSONB,
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Notifications', 'payload')
};
