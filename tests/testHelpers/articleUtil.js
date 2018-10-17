import db from '../../models';
import { assertErrorResponse, assertResponseStatus, getRequest } from './index';

const { Article, User } = db;

export const defaultArticle = {
  title: 'How to train your dragon',
  description: 'Ever wonder how?',
  body:
    'Nunc sed diam suscipit, lobortis eros nec, auctor nisl. Nunc ac magna\n'
    + '          non justo varius rutrum sit amet feugiat elit. Pellentesque vehicula,\n'
    + '          ante rutrum condimentum tempor, purus metus vulputate ligula, et\n'
    + '          commodo tortor massa eu tortor.'
};

/**
 *
 * @param {response} response
 * @param {Article} article
 * @param {User} user
 * @param {Array} tags
 * @return {void}
 */
export function assertArticleResponse(response, article, user, tags) {
  response.body.should.be.a('object');
  response.body.should.have.property('article');
  response.body.article.should.have.property('title').eq(article.title);
  response.body.article.should.have.property('body').eq(article.body);
  response.body.article.should.have.property('description').eq(article.description);
  response.body.article.should.have.property('slug');

  response.body.article.should.have.property('author');
  response.body.article.author.should.have.property('username').eq(user.username);
  response.body.article.author.should.have.property('bio');
  response.body.article.author.should.have.property('imageUrl');

  response.body.article.should.have.property('tags');
  response.body.article.tags.should.be.a('Array');
  if (tags) {
    response.body.article.tags.length.should.be.eql(tags.length);
  }
}

/**
 *
 * @param {string} url
 * @param {string} jwt
 * @param {boolean} update
 * @return {Promise<void>} return a Promise
 */
export async function validateArticleInput(url, jwt, update) {
  const response0 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    description: 'Ever wonder how?'
  });
  const response1 = await getRequest(url, jwt, update).send({
    description: 'Ever wonder how?',
    body: 'It takes a Jacobian'
  });
  const response2 = await getRequest(url, jwt, update).send({
    title: '            ',
    description: 'Ever wonder how?',
    body: 'It takes a Jacobian'
  });
  const response3 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: '        '
  });
  const response4 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    body: 'body body'
  });
  const response5 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    description: '               ',
    body: 'body 6body'
  });

  const response6 = await getRequest(url, jwt, update).send({
    title: 'How',
    description: 'Ever wonder how?',
    body: 'body body'
  });

  const response7 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'body body',
    tags: 'eesff '
  });

  const response8 = await getRequest(url, jwt, update).send({
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'body body',
    tags: ['eesff ', '            ']
  });
  const response9 = await getRequest(url, jwt, update).send({
    title: defaultArticle.body,
    description: 'Ever wonder how?',
    body: 'body body',
    tags: ['eesff ']
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
  assertResponseStatus(response7, 400);
  assertErrorResponse(response7);
  assertResponseStatus(response8, 400);
  assertErrorResponse(response8);
  assertResponseStatus(response9, 400);
  assertErrorResponse(response9);
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
 * @param {Integer} userIndex index of user to be selected
 * @return {Promise<void>} Create 10 dummy articles
 */
export async function createDummyArticles(userIndex = 0) {
  const slug = 'dummy-slug';
  const articleModels = [];
  for (let count = 1; count < 11; count += 1) {
    const newArticlePromise = Article.create({
      ...defaultArticle,
      slug: `${slug}-${count + userIndex * 10}` // to avoid slug constraint error
    });
    articleModels.push(newArticlePromise);
  }
  const [users, ...articles] = await Promise.all([User.findAll(), ...articleModels]);
  const articlesWithOwnersPromise = [];
  articles.forEach((articleData) => {
    articlesWithOwnersPromise.push(articleData.setUser(users[userIndex]));
  });
  await Promise.all(articlesWithOwnersPromise);
}
