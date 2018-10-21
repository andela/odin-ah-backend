import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { AUTHORIZATION_HEADER, MAX_INT } from '../../helpers/constants';
import { defaultArticle } from '../testHelpers/articleUtil';
import {
  assertErrorResponse,
  assertResponseStatus,
  assertTrue, deleteTable,
  getRequest,
  initCommentTest
} from '../testHelpers';
import {
  assertCommentArrayResponse, assertCommentResponse,
  assertCommentWithSubCommentResponse, body,
  commentToSave,
  createComments,
  createDummyCommentWithSubComments
} from '../testHelpers/commentUtil';

const { Comment } = db;

chai.use(chaiHttp);
chai.should();

describe('Comment CRUD Test', () => {
  let mainAuthor = null;
  let mainArticle = null;
  let commenter = null;
  let nonCommenter = null;
  let firstLevelComment = null;
  let firstLevelComment2 = null;
  before(async () => {
    const data = await initCommentTest();
    mainAuthor = data.author;
    mainArticle = data.article;
    commenter = data.user1;
    nonCommenter = data.user2;
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
  describe('POST /api/v1/articles/:slug/comments', () => {
    beforeEach(async () => {
      await deleteTable(Comment);
    });
    it('should have a valid input', async () => {
      const invalidBody = '                 ';
      const jwt = Authorization.generateToken(commenter);
      const url = `/api/v1/articles/${mainArticle.slug}/comments`;

      let response = await getRequest(url, jwt, false)
        .send({});
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await getRequest(url, jwt, false)
        .send({ invalidBody });
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });

    it('should return 404 error when article does not exists', async () => {
      const jwt = Authorization.generateToken(commenter);
      const url = '/api/v1/articles/does-not-exists/comments';

      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should create new comment for logged in user', async () => {
      const user = commenter;
      const article = mainArticle;
      const jwt = Authorization.generateToken(user);

      const url = `/api/v1/articles/${article.slug}/comments`;
      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 201);
      assertCommentResponse(response, body, user);
    });
    it('should not POST comment if token is not provided', async () => {
      const url = `/api/v1/articles/${mainArticle.slug}/comments`;
      const response = await chai.request(server)
        .post(url)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });

  describe('POST /api/v1/articles/:slug/comments/:id', () => {
    beforeEach(async () => {
      await deleteTable(Comment);
      [firstLevelComment, firstLevelComment2] = await Promise.all([
        createDummyCommentWithSubComments(commenter, mainArticle, mainAuthor, 5),
        createComments(commenter, mainArticle, 1)
      ]);
    });
    it('should have a valid input', async () => {
      const article = mainArticle;
      const invalidBody = '                 ';
      const jwt = Authorization.generateToken(mainAuthor);

      const url = `/api/v1/articles/${article.slug}/comments/${firstLevelComment.id}`;
      const badUrl = `/api/v1/articles/${article.slug}/comments/bad-id`;

      let response = await getRequest(url, jwt, false)
        .send({});
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await getRequest(url, jwt, false)
        .send({ invalidBody });
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await getRequest(badUrl, jwt, false)
        .send({ body: '876rfbnmvr567ujn ko0oikmn vcfr5678ikm vgyui09876trfvb mkio09iujhb' });
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });
    it('should return 404 error when article does not exists', async () => {
      const jwt = Authorization.generateToken(commenter);
      const url = `/api/v1/articles/does-not-exists/comments/${firstLevelComment.id}`;
      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should return 404 error when comments does not exists', async () => {
      const jwt = Authorization.generateToken(commenter);
      const url = `/api/v1/articles/${mainArticle.slug}/comments/${MAX_INT}`;
      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should create comment of a comment for logged in user', async () => {
      const user = mainAuthor;
      const article = mainArticle;
      const jwt = Authorization.generateToken(user);

      const url = `/api/v1/articles/${article.slug}/comments/${firstLevelComment.id}`;
      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 201);
      assertCommentResponse(response, body, user);
    });
    it('should not POST comment on a sub-comment', async () => {
      const secondLevelComment = await Comment.create({ body: 'wsddddddd' });
      secondLevelComment.setUser(mainAuthor);
      secondLevelComment.setParent(firstLevelComment);
      secondLevelComment.setArticle(mainArticle);

      const jwt = Authorization.generateToken(commenter);

      const url = `/api/v1/articles/${mainArticle.slug}/comments/${secondLevelComment.id}`;
      const response = await getRequest(url, jwt, false)
        .send({ body });
      assertResponseStatus(response, 403);
    });
  });

  describe('GET /api/v1/articles/:slug/comments', () => {
    before(async () => {
      await deleteTable(Comment);
      [firstLevelComment, firstLevelComment2] = await Promise.all([
        createDummyCommentWithSubComments(commenter, mainArticle, mainAuthor, 5),
        createComments(commenter, mainArticle, 12)
      ]);
    });
    it('should get a list of comment for a given article, without sub-comments. No authentication required',
      async () => {
        let url = `/api/v1/articles/${mainArticle.slug}/comments`;
        let response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        assertCommentArrayResponse(response, 13);
        url = `${url}?page=2&size=10`;
        response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        assertCommentArrayResponse(response, 3);
      });
    it('should return empty list of comments', async () => {
      await deleteTable(Comment);
      const url = `/api/v1/articles/${mainArticle.slug}/comments`;
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 200);
      assertCommentArrayResponse(response, 0);
    });
    it('should return 404 error when article does not exists', async () => {
      const url = '/api/v1/articles/does-not-exists/comments';
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });

  describe('GET /api/v1/articles/:slug/comments/:id', () => {
    before(async () => {
      await deleteTable(Comment);
      [firstLevelComment, [firstLevelComment2]] = await Promise.all([
        createDummyCommentWithSubComments(commenter, mainArticle, mainAuthor, 10),
        createComments(commenter, mainArticle, 1)
      ]);
    });
    it('should get a list of comment for a given comment. No authentication required',
      async () => {
        let url = `/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment.id}`;
        let response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        response.body.should.have.property('message');
        response.body.should.have.property('status');
        assertCommentResponse(response, firstLevelComment.body, commenter);
        assertCommentWithSubCommentResponse(response, 10);

        url = `${url}?page=3&size=1`;
        response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        response.body.should.have.property('message');
        response.body.should.have.property('status');
        assertCommentResponse(response, firstLevelComment.body, commenter);
        assertCommentWithSubCommentResponse(response, 1);
      });
    it('should get a list of comment for a given comment. No authentication required',
      async () => {
        const url = `/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment2.id}`;
        const response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        response.body.should.have.property('message');
        response.body.should.have.property('status');

        assertCommentResponse(response, firstLevelComment2.body, commenter);
        assertCommentWithSubCommentResponse(response, 0);
      });
    it('should return 404 error when article does not exists', async () => {
      const url = '/api/v1/articles/does-not-exists/comments';
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should return 404 error when comments does not exists', async () => {
      const url = `/api/v1/articles/${mainArticle.slug}/comments/${MAX_INT}`;
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not get list if id is not valid', async () => {
      const url = `/api/v1/articles/${mainArticle.slug}/comments/67uhbn`;
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });
  });

  describe('DELETE /api/v1/articles/:slug/comments/id', () => {
    beforeEach(async () => {
      await deleteTable(Comment);
      [firstLevelComment, [firstLevelComment2]] = await Promise.all([
        createDummyCommentWithSubComments(commenter, mainArticle, mainAuthor, 5),
        createComments(commenter, mainArticle, 1)
      ]);
    });
    it('should delete comment and its child comment author by user', async () => {
      const jwt = Authorization.generateToken(commenter);

      const comment = await Comment.create(commentToSave);
      await comment.setParent(firstLevelComment);
      const response = await chai.request(server)
        .delete(`/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment.id}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 200);
      let comments = await Comment.findAll({
        where: { parentId: firstLevelComment.id }
      });
      assertTrue(comments.length === 0);
      comments = await Comment.findOne({
        where: { id: firstLevelComment.id },
      });
      assertTrue(comments === null);
      comments = await Comment.findOne({
        where: { id: comment.id },
      });
      assertTrue(comments === null);
    });
    it('should delete comment with no child comment author by user', async () => {
      const jwt = Authorization.generateToken(commenter);

      const response = await chai.request(server)
        .delete(`/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment2.id}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 200);
      let comments = await Comment.findAll({
        where: { parentId: firstLevelComment2.id }
      });
      assertTrue(comments.length === 0);
      comments = await Comment.findOne({
        where: { id: firstLevelComment2.id },
      });
      assertTrue(comments === null);
    });
    it('should not delete comment not authored by user', async () => {
      const jwt = Authorization.generateToken(nonCommenter);

      const response = await chai.request(server)
        .delete(`/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment.id}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should return 404 when article does not exists', async () => {
      const jwt = Authorization.generateToken(commenter);
      let url = `/api/v1/articles/does-not-exists/comments/${MAX_INT}`;
      let response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);

      url = `/api/v1/articles/does-not-exist/comments/${MAX_INT}`;
      response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should return 404 error when comments does not exists', async () => {
      const jwt = Authorization.generateToken(commenter);
      let url = `/api/v1/articles/${mainArticle.slug}/comments/${MAX_INT}`;
      let response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);

      url = `/api/v1/articles/does-not-exist/comments/${MAX_INT}`;
      response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not DELETE article token is not provided', async () => {
      const url = `/api/v1/articles/${mainArticle.slug}/comments`;
      const response = await chai.request(server)
        .delete(url)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
    it('should not get list if id is not valid', async () => {
      const jwt = Authorization.generateToken(commenter);
      const url = `/api/v1/articles/${mainArticle.slug}/comments/67uhbn`;
      const response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });
  });
});
