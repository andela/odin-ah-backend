/* eslint-disable import/no-dynamic-require */
const users = require(`${__dirname}/data/seeder_users.json`);
const articles = require(`${__dirname}/data/seeder_articles.json`);
const tags = require(`${__dirname}/data/seeder_tags.json`);
const comments = require(`${__dirname}/data/seeder_comments.json`);
const articleTags = require(`${__dirname}/data/seeder_articleTags.json`);


module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', users, {})
    .then(() => queryInterface.bulkInsert('Articles', articles, {}))
    .then(() => queryInterface.bulkInsert('Tags', tags, {}))
    .then(() => queryInterface.bulkInsert('Comments', comments, {}))
    .then(() => queryInterface.bulkInsert('ArticleTags', articleTags, {})),

  down: queryInterface => queryInterface.bulkDelete('ArticleTags', null, {})
    .then(() => queryInterface.bulkDelete('Comments', null, {}))
    .then(() => queryInterface.bulkDelete('Tags', null, {}))
    .then(() => queryInterface.bulkDelete('Articles', null, {}))
    .then(() => queryInterface.bulkDelete('Users', null, {}))
};
