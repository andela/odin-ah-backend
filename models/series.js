
module.exports = (sequelize, DataTypes) => {
  const Series = sequelize.define('Series', {
    description: DataTypes.STRING,
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  }, {});
  Series.associate = (models) => {
    Series.hasMany(models.Article, { as: 'articles', foreignKey: 'seriesId' });
    Series.belongsTo(models.User, { as: 'user' });
    Series.belongsToMany(models.User, { as: 'followers', through: 'FollowSeries', foreignKey: 'seriesId' });

    Series.belongsToMany(models.Tag, {
      as: 'tags',
      through: 'SeriesTags',
      foreignKey: 'seriesId'
    });
  };
  return Series;
};
