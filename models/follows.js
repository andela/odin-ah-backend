export default (sequelize, DataTypes) => {
  const Follows = sequelize.define('Follows', {
    follower: DataTypes.INTEGER,
    following: DataTypes.INTEGER,
  }, {});
  Follows.associate = (models) => {
    // associations can be defined here
    Follows.belongsToMany(models.User, {
      foreignKey: 'followsId',
      through: 'UserFollows'
    });
  };
  return Follows;
};
