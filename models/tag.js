module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: DataTypes.STRING
  }, {});
  Tag.associate = (models) => {
    // associations can be defined here
    Tag.belongsToMany(models.Article, { through: 'ArticleTags', foreignKey: 'tagId' });
  };
  return Tag;
};
