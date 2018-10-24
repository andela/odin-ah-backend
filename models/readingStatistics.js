export default (sequelize, DataTypes) => {
  const ReadingStatistics = sequelize.define('ReadingStatistics', {
    authorId: DataTypes.INTEGER,
    articleSlug: DataTypes.STRING,
    readerId: DataTypes.INTEGER,
    isUnique: DataTypes.BOOLEAN
  }, {});
  ReadingStatistics.associate = function () {
    // associations can be defined here
  };
  return ReadingStatistics;
};
