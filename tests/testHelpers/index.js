/**
 *  Assert the response body is an error
 * @param {response} response
 * @return {void}
 */
import chai, { expect } from 'chai';
import server from '../../index';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';


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
 * @param {number} status
 * @return {void}
 */
export function assertResponseStatus(response, status) {
  const code = status || 200;
  response.should.have.status(code);
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
