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
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    token: Sequelize.STRING,
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    bio: Sequelize.STRING,
    imageUrl: Sequelize.STRING,
    password: Sequelize.STRING,
  }, {
    timestamps: true,
  });
  User.hook('beforeCreate', (user) => {
    user.email = user.email.toLowerCase();
    user.password = bcrypt.hashSync(user.password, 10);
  });

  User.associate = () => {
    // associations can be defined here
  };
  return User;
};
