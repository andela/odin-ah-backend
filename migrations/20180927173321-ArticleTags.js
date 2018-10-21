module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ArticleTags',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        reference: {
          model: 'Tags',
          key: 'id',
        }
      },
      articleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Articles',
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

  down: queryInterface => queryInterface.dropTable('ArticleTags')

};
