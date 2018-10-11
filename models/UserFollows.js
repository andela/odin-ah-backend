export default (sequelize, DataTypes) => {
  const UserFollows = sequelize.define('UserFollows', {
    userId: DataTypes.INTEGER,
    followsId: DataTypes.INTEGER
  }, {});

  return UserFollows;
};
