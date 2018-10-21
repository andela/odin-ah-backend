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
      password: Sequelize.STRING,
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          newFollower: true,
          newArticleFromUserFollowing: true,
          articleComment: true,
          articleLike: true,
          emailSubscribe: true,
          newFollowerOnSeries: true
        }
      },
      role: {
        type: Sequelize.ENUM(['user', 'admin', 'superadmin']),
        defaultValue: 'user'
      }
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
    User.hasMany(models.Article, { as: 'articles', foreignKey: 'userId' });
    User.hasMany(models.Comment, { as: 'comments', foreignKey: 'userId' });
    User.hasMany(models.Bookmark, { as: 'bookmarks', foreignKey: 'userId' });

    User.hasMany(models.Notifications, { as: 'Notification', foreignKey: 'userId' });
    User.belongsToMany(models.Follows, {
      foreignKey: 'userId',
      through: 'UserFollows'
    });
    User.belongsToMany(models.Series, { through: 'FollowSeries', foreignKey: 'userId' });
  };
  return User;
};
