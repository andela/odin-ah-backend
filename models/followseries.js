
module.exports = (sequelize, DataTypes) => sequelize.define('FollowSeries', {
  userId: DataTypes.INTEGER,
  seriesId: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM,
    values: ['FOLLOW', 'UNFOLLOW'],
  },
}, {});
