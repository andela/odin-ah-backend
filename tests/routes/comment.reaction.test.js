import chai from 'chai';
import chaiHttp from 'chai-http';
import db from '../../models';

import { AUTHORIZATION_HEADER, MAX_INT } from '../../helpers/constants';
import {
  assertErrorResponse,
  assertResponseStatus,
  deleteTable,
  initCommentTest
} from '../testHelpers';
import server from '../../index';
import Authorization from '../../middlewares/Authorization';

const {
  Comment, CommentReaction,
} = db;
const body = 'Nunc sed diam suscipit, lobortis eros nec, auctor nisl. Nunc ac magna\n'
  + '          non justo varius rutrum sit amet feugiat elit. Pellentesque vehicula,\n'
  + '          ante rutrum condimentum tempor, purus metus vulputate ligula, et\n'
  + '          commodo tortor massa eu tortor.';

chai.use(chaiHttp);
chai.should();

let mainArticle = null;
let comment = null;
let commenter = null;
let nonCommenter = null;
let baseUrl = null;

describe('Comment Reaction Test - POST /api/v1/articles/:slug/comments/:comment-id/reactions',
  () => {
    before(async () => {
      const data = await initCommentTest();
      mainArticle = data.article;
      commenter = data.user1;
      nonCommenter = data.user2;
      comment = await Comment.create({ body });
      baseUrl = `/api/v1/articles/${mainArticle.slug}/comments/${comment.id}/reactions`;
      await Promise.all([
        comment.setUser(commenter),
        comment.setArticle(mainArticle)
      ]);
    });
    beforeEach(async () => {
      await deleteTable(CommentReaction);
    });
    it('should provide valid request input', async () => {
      const jwt = Authorization.generateToken(nonCommenter.id);
      let response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({});
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({ reaction: '-like-' });
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });

    it('should react to a comment when user is authenticated', async () => {
      const user1Jwt = Authorization.generateToken(commenter.id);
      const user2Jwt = Authorization.generateToken(nonCommenter.id);
      let response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${user1Jwt}`)
        .send({ reaction: 'like' });
      assertResponseStatus(response, 201);
      response.body.should.be.a('object');
      response.body.should.have.property('message');
      response.body.should.have.property('status');
      response.body.should.have.property('reaction').eq('like');

      response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${user2Jwt}`)
        .send({ reaction: 'dislike' });
      assertResponseStatus(response, 201);
      response.body.should.be.a('object');
      response.body.should.have.property('message');
      response.body.should.have.property('status');
      response.body.should.have.property('reaction').eq('dislike');
    });

    it('should allow user update their reaction', async () => {
      const userId = nonCommenter.id;
      await CommentReaction.create({
        reaction: 'like',
        userId,
        commentId: comment.id,
      });
      const jwt = Authorization.generateToken(userId);
      const response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({ reaction: 'dislike' });
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      response.body.should.have.property('message');
      response.body.should.have.property('status');
      response.body.should.have.property('reaction').eq('dislike');
    });

    it('should remove authors reaction from a comment, only if the reaction exists', async () => {
      const userId = commenter.id;
      await CommentReaction.create({
        reaction: 'like',
        userId,
        commentId: comment.id,
      });
      const jwt = Authorization.generateToken(userId);
      const response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({ reaction: 'neutral' });
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      response.body.should.have.property('message');
      response.body.should.have.property('reaction').eq('neutral');
      response.body.should.have.property('status');
    });

    it('should not remove authors reaction from a comment, if authors hasn\'t reacted to the comment', async () => {
      const jwt = Authorization.generateToken(commenter.id);
      const response = await chai.request(server)
        .post(baseUrl)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({ reaction: 'neutral' });
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });

    it('should not like a comment when user is not authenticated', async () => {
      const response = await chai.request(server)
        .post(baseUrl)
        .send({ reaction: 'like' });
      assertResponseStatus(response, 401);
      assertErrorResponse(response);
    });

    it('should not react to a comment that does not exists', async () => {
      const jwt = Authorization.generateToken(nonCommenter.id);
      const response = await chai.request(server)
        .post(`/api/v1/articles/${mainArticle.slug}/comments/${MAX_INT}/reactions`)
        .set(AUTHORIZATION_HEADER, `Bearer: ${jwt}`)
        .send({ reaction: 'like' });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });
