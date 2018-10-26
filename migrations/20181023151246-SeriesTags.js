module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('SeriesTags',
    {
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        reference: {
          model: 'Tags',
          key: 'id',
        }
      },
      seriesId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Series',
          key: 'id',
        },
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    }),

  down: queryInterface => queryInterface.dropTable('SeriesTags')

};
