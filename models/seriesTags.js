module.exports = (sequelize, DataTypes) => sequelize.define('SeriesTags', {
  seriesId: DataTypes.INTEGER,
  tagId: DataTypes.INTEGER
}, {});
