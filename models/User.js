import bcrypt from 'bcrypt';

export default (sequelize, Sequelize) => {
  const User = sequelize.define('User', {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isAlphanumeric: true,
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    bio: Sequelize.STRING,
    image: Sequelize.STRING,
    password: Sequelize.STRING,
  }, {
    timestamps: true,
  });

  User.hook('beforeCreate', (user, options) => {
    user.email = user.email.toLowerCase();
    user.password = bcrypt.hashSync(user.password, 10);
  });

  User.associate = () => {
    // associations can be defined here
  };
  return User;
};
