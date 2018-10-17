export default (sequelize, DataTypes) => {
  const Notifications = sequelize.define('Notifications', {
    userId: DataTypes.INTEGER,
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    message: DataTypes.STRING,
  }, {});
  Notifications.associate = (models) => {
    Notifications.belongsTo(models.User, {
      as: 'user',
    });
  };
  return Notifications;
};
