export default (sequelize, DataTypes) => sequelize.define('ReadingStatistics', {
  authorId: DataTypes.INTEGER,
  articleSlug: DataTypes.STRING,
  readerId: DataTypes.INTEGER,
  isUnique: DataTypes.BOOLEAN
}, {});
