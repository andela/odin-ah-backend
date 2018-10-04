module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    username: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    token: Sequelize.STRING,
    bio: Sequelize.STRING,
    image: Sequelize.STRING,
    password: Sequelize.STRING,
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    },
  }),

  down: queryInterface => queryInterface.dropTable('Users')

};
