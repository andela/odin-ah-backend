module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(
    'Articles',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING,
        unique: true
      },
      body: {
        type: Sequelize.TEXT
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      readingTime: {
        type: Sequelize.STRING
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      isPrivate: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      disabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    {
      timestamps: false
    }
  ),
  down: queryInterface => queryInterface.dropTable('Articles')
};
