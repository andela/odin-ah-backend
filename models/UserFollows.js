export default (sequelize, DataTypes) => sequelize.define('UserFollows',
  {
    userId: DataTypes.INTEGER,
    followsId: DataTypes.INTEGER
  }, {});
