/**
 *  Assert the response body is an error
 * @param {response} response
 * @return {void}
 */
import chai, { expect } from 'chai';
import server from '../../index';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import { realUser, realUser1, realUser2 } from './testLoginData';
import { defaultArticle } from './articleUtil';
import db from '../../models';


const { Article, User } = db;

/**
 *
 * @param {response}response
 * @return {void} Assert the body of response for errors
 */
export function assertErrorResponse(response) {
  response.body.should.be.a('object');
  response.body.should.have.property('status')
    .eq('error');
  response.body.should.have.property('message');
}

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
 * @param {number} [status]
 * @return {void}
 */
export function assertResponseStatus(response, status = 200) {
  response.should.have.status(status);
  response.body.should.be.a('object');
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
 * @param {Model} model
 * @return {Promise<void>} delete all entries in the comment table
 */
export async function deleteTable(model) {
  await model.destroy({
    truncate: true,
    cascade: true
  });
}

/**
 *
 * @return {Promise<void>} initialize data for testing
 */
export async function initCommentTest() {
  await deleteTable(User);
  const slug = 'dummy-slug';
  const [author, user1, user2, article] = await Promise.all(
    [
      User.create(realUser), User.create(realUser1), User.create(realUser2),
      Article.create({
        ...defaultArticle,
        slug: `${slug}-1`
      }),
    ]
  );
  await article.setUser(author);
  return {
    author,
    user1,
    user2,
    article
  };
}
