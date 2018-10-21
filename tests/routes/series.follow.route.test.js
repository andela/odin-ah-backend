import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { realUser, realUser1 } from '../testHelpers/testLoginData';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import { defaultArticle } from '../testHelpers/articleUtil';
import {
  assertErrorResponse, assertResponseStatus, deleteTable, getRequest
} from '../testHelpers';
import { createDummySeries } from '../testHelpers/seriesUtil';

const {
  Article, User, Tag, Series, FollowSeries
} = db;

chai.use(chaiHttp);
chai.should();

describe('Follow Series Test', () => {
  let author, follower, series, baseUrl, followerJwt;

  before(async () => {
    await deleteTable(Tag);
    await deleteTable(Article);
    await deleteTable(Series);
    await deleteTable(User);
    [author, follower] = await Promise.all([
      User.create({
        ...realUser,
        isVerified: true
      }),
      User.create({
        ...realUser1,
        isVerified: true
      })]);
    series = await createDummySeries(author, 0);
    baseUrl = `/api/v1/series/${series.slug}`;

    followerJwt = Authorization.generateToken(follower);
  });

  let mockSGMailSend;
  before(() => {
    mockSGMailSend = sinon.stub(sgMail, 'send')
      .returns(Promise.resolve([
        { statusCode: 202 },
        {
          status: 'success',
        }
      ]));
  });
  after(() => {
    mockSGMailSend.restore();
  });
  describe('POST /api/v1/series', () => {
    beforeEach(async () => {
      await deleteTable(FollowSeries);
    });
    it('should have a valid input parameters', async () => {
      let response0 = await getRequest(`${baseUrl}/jdbgcuxij`, followerJwt, false)
        .send({});
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(`${baseUrl}/1`, followerJwt, false)
        .send({});
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
    });
    it('should not follow or unfollow a series if user is the author of the series', async () => {
      const authJwt = Authorization.generateToken(author);
      let response = await chai.request(server)
        .post(`${baseUrl}/follow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${authJwt}`)
        .send(defaultArticle);
      assertResponseStatus(response, 403);

      response = await chai.request(server)
        .post(`${baseUrl}/unfollow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${authJwt}`)
        .send(defaultArticle);
      assertResponseStatus(response, 403);
    });
    it('should follow a series if user is authenticated', async () => {
      const response = await chai.request(server)
        .post(`${baseUrl}/follow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${followerJwt}`)
        .send(defaultArticle);
      assertResponseStatus(response, 200);
    });
    it('should not follow or unfollow a series if user is not authenticated', async () => {
      let response = await chai.request(server)
        .post(`${baseUrl}/follow`)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
      assertErrorResponse(response);
      response = await chai.request(server)
        .post(`${baseUrl}/unfollow`)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
      assertErrorResponse(response);
    });
    it('should unfollow a series if user is authenticated and has followed the series', async () => {
      await chai.request(server)
        .post(`${baseUrl}/follow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${followerJwt}`)
        .send(defaultArticle);
      const response = await chai.request(server)
        .post(`${baseUrl}/unfollow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${followerJwt}`)
        .send(defaultArticle);
      assertResponseStatus(response, 200);
    });
    it('should not unfollow a series if user is authenticated and has not followed the series', async () => {
      const response = await chai.request(server)
        .post(`${baseUrl}/unfollow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${followerJwt}`)
        .send(defaultArticle);
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should throw an error if there was an error following a series', async () => {
      const stubFindAll = sinon.stub(FollowSeries, 'findOne')
        .rejects();
      const response = await chai.request(server)
        .post(`${baseUrl}/follow`)
        .set(AUTHORIZATION_HEADER, `Bearer ${followerJwt}`)
        .send({});
      stubFindAll.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
  });
});
