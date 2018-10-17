// https://medium.com/riipen-engineering/full-text-search-with-sequelize-and-postgresql-3572cb3093e7
/* eslint-disable max-len */

const sqlUtil = require('../helpers/rawSqlHelpers');

const vectorName = '_search';

const searchObjects = {
  Articles: ['body', 'title']
};

module.exports = {
  up: queryInterface => queryInterface.sequelize.transaction(t => Promise.all(
    Object.keys(searchObjects).map(table => queryInterface.sequelize
      .query(sqlUtil.addCustomTypeColumn(table, vectorName, 'TSVECTOR'), { transaction: t })
      .then(() => queryInterface.sequelize.query(
        sqlUtil.updateTsVectorColumn(table, vectorName, searchObjects[table]),
        { transaction: t }
      ))
      .then(() => queryInterface.sequelize.query(sqlUtil.createGinIndexOnColumn(table, vectorName), {
        transaction: t
      }))
      .then(() => queryInterface.sequelize.query(
        sqlUtil.createTriggerOnVectorTable(table, vectorName, searchObjects[table]),
        { transaction: t }
      ))
      .error())
  )),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all(
    Object.keys(searchObjects).map(table => queryInterface.sequelize
      .query(sqlUtil.dropTriggerOnVectorTable(table), { transaction: t })
      .then(() => queryInterface.sequelize.query(sqlUtil.dropIndexOnColumn(table), { transaction: t }))
      .then(() => queryInterface.removeColumn(table, vectorName, {
        transaction: t
      }))
      .error())
  ))
};
