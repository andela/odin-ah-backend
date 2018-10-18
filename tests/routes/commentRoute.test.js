import chai from 'chai';
import chaiHttp from 'chai-http';
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

const { Comment } = db;

chai.use(chaiHttp);
chai.should();

let mainAuthor = null;
let mainArticle = null;
let commenter = null;
let nonCommenter = null;
let firstLevelComment = null;

/**
 *
 * @param {response} response
 * @param {string} body
 * @param {User} user
 * @return {void}
 */
function assertCommentResponse(response, body, user) {
  response.body.should.be.a('object');
  response.body.should.have.property('comment');
  response.body.comment.should.have.property('body')
    .eq(body);

  response.body.comment.should.have.property('author');
  response.body.comment.author.should.have.property('username')
    .eq(user.username);
  response.body.comment.author.should.have.property('bio');
  response.body.comment.author.should.have.property('imageUrl');
}

const body = 'Nunc sed diam suscipit, lobortis eros nec, auctor nisl. Nunc ac magna\n'
  + '          non justo varius rutrum sit amet feugiat elit. Pellentesque vehicula,\n'
  + '          ante rutrum condimentum tempor, purus metus vulputate ligula, et\n'
  + '          commodo tortor massa eu tortor.';

const commentToSave = { body };

/**
 * @return {Promise<void>} create dummy comments
 */
async function createDummyComments() {
  const [parentComment1, parentComment2, ...comments] = await Promise.all([
    Comment.create(commentToSave),
    Comment.create(commentToSave),

    Comment.create(commentToSave),
    Comment.create(commentToSave),
    Comment.create(commentToSave),
    Comment.create(commentToSave),
    Comment.create(commentToSave),
  ]);

  const article = mainArticle;
  const author = mainAuthor;
  const bulkUpdates = [];
  firstLevelComment = parentComment1;
  bulkUpdates.push(parentComment1.setUser(commenter));
  bulkUpdates.push(parentComment1.setArticle(article));

  bulkUpdates.push(parentComment2.setUser(commenter));
  bulkUpdates.push(parentComment2.setArticle(article));

  comments.forEach((comment) => {
    bulkUpdates.push(comment.setUser(author));
    bulkUpdates.push(comment.setArticle(article));
    bulkUpdates.push(comment.setParent(parentComment1));
  });

  await Promise.all(bulkUpdates);
}

/**
 *
 * @param {response}response
 * @param {number}length
 * @return {void} Assert the body of response
 */
function assertCommentArrayResponse(response, length) {
  response.body.data.should.be.a('object');
  response.body.should.have.property('data');
  response.body.should.have.property('message');
  response.body.should.have.property('status');
  response.body.data.should.have.property('comments');
  response.body.data.should.have.property('count');
  response.body.data.comments.should.be.a('Array');
  response.body.data.comments.length.should.be.eql(length);
  if (length > 0) {
    response.body.data.comments[0].should.have.property('id');
    response.body.data.comments[0].should.have.property('body');
    response.body.data.comments[0].should.have.property('createdAt');
    response.body.data.comments[0].should.have.property('author');
  }
}

describe('Comment CRUD Test', () => {
  before(async () => {
    const data = await initCommentTest();
    mainAuthor = data.author;
    mainArticle = data.article;
    commenter = data.user1;
    nonCommenter = data.user2;
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
      await createDummyComments();
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
      await createDummyComments();
    });
    it('should get a list of comment for a given article, without sub-comments. No authentication required',
      async () => {
        const url = `/api/v1/articles/${mainArticle.slug}/comments`;
        const response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);
        assertCommentArrayResponse(response, 2);
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
      await createDummyComments();
    });
    it('should get a list of comment for a given comment. No authentication required',
      async () => {
        const url = `/api/v1/articles/${mainArticle.slug}/comments/${firstLevelComment.id}`;
        const response = await chai.request(server)
          .get(url)
          .send();
        assertResponseStatus(response, 200);

        response.body.comment.should.be.a('object');
        response.body.should.have.property('comment');
        assertCommentResponse(response, firstLevelComment.body, commenter);
        response.body.should.have.property('message');
        response.body.should.have.property('status');
        response.body.comment.should.have.property('comments');
        response.body.comment.should.have.property('count');
        response.body.comment.comments.should.be.a('Array');
        response.body.comment.comments.length.should.be.eql(5);
        response.body.comment.comments[0].should.have.property('id');
        response.body.comment.comments[0].should.have.property('body');
        response.body.comment.comments[0].should.have.property('createdAt');
        response.body.comment.comments[0].should.have.property('author');
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
      await createDummyComments();
    });
    it('should delete comment author by user', async () => {
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
