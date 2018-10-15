import bcrypt from 'bcrypt';

export default (sequelize, Sequelize) => {
  const User = sequelize.define(
    'User', {
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isAlphanumeric: true
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
        defaultValue: false
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
      password: Sequelize.STRING
    }, {
      timestamps: true
    }
  );
  User.hook('beforeCreate', (user) => {
    user.email = user.email.toLowerCase();
    if (user.password) user.password = bcrypt.hashSync(user.password, 10);
  });
  User.hook('beforeBulkCreate', (users) => {
    users.map((user) => {
      user.email = user.email.toLowerCase();
      if (user.password) user.password = bcrypt.hashSync(user.password, 10);
      return user;
    });
  });

  User.associate = (models) => {
    User.hasMany(models.Article, { as: 'Articles', foreignKey: 'userId' });
    User.hasMany(models.Comment, { as: 'Comments', foreignKey: 'userId' });
    User.hasMany(models.Bookmark, { as: 'Bookmarks', foreignKey: 'userId' });

    User.belongsToMany(models.Follows, {
      foreignKey: 'userId',
      through: 'UserFollows'
    });
  };
  return User;
};
