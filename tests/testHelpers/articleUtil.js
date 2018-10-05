import chai, { expect } from 'chai';
import server from '../../index';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import db from '../../models';

const { Article, User } = db;

export const defaultArticle = {
  title: 'How to train your dragon',
  description: 'Ever wonder how?',
  body: 'It takes a Jacobian',
};

/**
 *
 * @param {boolean} match
 * @return {void} void
 *
 */
export function assertTrue(match) {
  expect(match)
    .to
    .be
    .a('boolean')
    .eq(true);
}

/**
 *  Assert the response status code
 * @param {res} response
 * @param {number} status
 * @return {void}
 */
export function assertResponseStatus(response, status) {
  const code = status || 200;
  response.should.have.status(code);
  response.body.should.be.a('object');
}

/**
 *  Assert the response body is an error
 * @param {response} response
 * @return {void}
 */
export function assertErrorResponse(response) {
  response.body.should.be.a('object');
  response.body.should.have.property('status')
    .eq('error');
  response.body.should.have.property('message');
}

/**
 *
 * @param {response} response
 * @param {Article} article
 * @param {User} user
 * @return {void}
 */
export function assertArticleResponse(response, article, user) {
  response.body.should.be.a('object');
  response.body.should.have.property('article');
  response.body.article.should.have.property('title')
    .eq(article.title);
  response.body.article.should.have.property('body')
    .eq(article.body);
  response.body.article.should.have.property('description')
    .eq(article.description);
  response.body.article.should.have.property('slug');

  response.body.article.should.have.property('author');
  response.body.article.author.should.have.property('username')
    .eq(user.username);
  response.body.article.author.should.have.property('bio');
  response.body.article.author.should.have.property('imageUrl');
}

/**
 * Helper function
 * @param {string} url
 * @param {string} jwt
 * @param {boolean} update
 * @return {*} return a chai request object
 */
export function getRequest(url, jwt, update) {
  let request = chai.request(server);
  if (update) {
    request = request.put(url);
  } else {
    request = request.post(url);
  }
  return request.set(AUTHORIZATION_HEADER, `Bearer ${jwt}`);
}

/**
 *
 * @param {string} url
 * @param {string} jwt
 * @param {boolean} update
 * @return {Promise<void>} return a Promise
 */
export async function validateArticleInput(url, jwt, update) {
  const response0 = await getRequest(url, jwt, update)
    .send({
      title: 'How to train your dragon',
      description: 'Ever wonder how?'
    });
  const response1 = await getRequest(url, jwt, update)
    .send({
      description: 'Ever wonder how?',
      body: 'It takes a Jacobian'
    });
  const response2 = await getRequest(url, jwt, update)
    .send({
      title: '            ',
      description: 'Ever wonder how?',
      body: 'It takes a Jacobian',
    });
  const response3 = await getRequest(url, jwt, update)
    .send({
      title: 'How to train your dragon',
      description: 'Ever wonder how?',
      body: '        ',
    });
  const response4 = await getRequest(url, jwt, update)
    .send({
      title: 'How to train your dragon',
      body: 'body body',
    });
  const response5 = await getRequest(url, jwt, update)
    .send({
      title: 'How to train your dragon',
      description: '               ',
      body: 'body 6body',
    });

  const response6 = await getRequest(url, jwt, update)
    .send({
      title: 'How',
      description: 'Ever wonder how?',
      body: 'body body'
    });

  if (!update) {
    assertResponseStatus(response0, 400);
    assertErrorResponse(response0);
    assertResponseStatus(response1, 400);
    assertErrorResponse(response1);
    assertResponseStatus(response4, 400);
    assertErrorResponse(response4);
  }
  assertResponseStatus(response2, 400);
  assertErrorResponse(response2);
  assertResponseStatus(response3, 400);
  assertErrorResponse(response3);
  assertResponseStatus(response5, 400);
  assertErrorResponse(response5);
  assertResponseStatus(response6, 400);
  assertErrorResponse(response6);
}

/**
 *
 * @param {response}response
 * @param {number}length
 * @return {void} Assert the body of response
 */
export function assertArrayResponse(response, length) {
  response.body.data.should.be.a('object');
  response.body.should.have.property('data');
  response.body.should.have.property('message');
  response.body.should.have.property('status');
  response.body.data.should.have.property('articles');
  response.body.data.articles.should.be.a('Array');
  response.body.data.articles.length.should.be.eql(length);
}

/**
 *
 * @return {Promise<void>} Create 10 dummy articles
 */
export async function createDummyArticles() {
  const userModel = await User.findAll();
  const slug = 'dummy-slug';
  const articleModels = await Promise.all([
    Article.create({
      ...defaultArticle,
      slug: `${slug}-1`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-2`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-3`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-4`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-5`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-6`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-7`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-8`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-9`
    }),
    Article.create({
      ...defaultArticle,
      slug: `${slug}-10`
    }),
  ]);
  const addUserToArticlePromise = [];
  articleModels.forEach((articleData) => {
    addUserToArticlePromise.push(articleData.setUser(userModel[0]));
  });
  await Promise.all(addUserToArticlePromise);
}

/**
 *
 * @return {Promise<void>} Delete all articles from database
 */
export async function deleteArticlesFromTable() {
  await Article.destroy({
    truncate: true,
    cascade: true
  });
}
