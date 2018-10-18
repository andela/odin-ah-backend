import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { realUser, realUser1, realUser2 } from '../testHelpers/testLoginData';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import {
  assertArrayResponse,
  assertArticleResponse,
  createDummyArticles,
  defaultArticle,
  validateArticleInput
} from '../testHelpers/articleUtil';
import {
  assertErrorResponse, assertResponseStatus, assertTrue, deleteTable
} from '../testHelpers';

const { Article, User, Tag } = db;

chai.use(chaiHttp);
chai.should();

describe('Article CRUD Test', () => {
  let user1;
  let user2;
  let admin;
  before(async () => {
    await deleteTable(User);
    const isVerified = true;
    const role = 'admin';
    [user1, user2, admin] = await Promise.all([
      User.create({
        ...realUser,
        isVerified
      }),
      User.create({
        ...realUser1,
        isVerified
      }),
      User.create(({
        ...realUser2,
        isVerified,
        role
      }))
    ]);
  });
  describe('POST /api/v1/articles', () => {
    beforeEach(async () => {
      await deleteTable(Tag);
      await deleteTable(Article);
    });
    it('should have a valid input', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      await validateArticleInput('/api/v1/articles', jwt, false);
    });

    it('should create new article for logged in user', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const tags = ['nodejs', 'mocha'];
      const article = {
        ...defaultArticle,
        tags
      };
      const response = await chai.request(server)
        .post('/api/v1/articles')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      assertResponseStatus(response, 201);
      assertArticleResponse(response, article, user, tags);
    });
    it('should throw an error if there was an error creating an article', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const tags = ['nodejs', 'mocha'];
      const article = {
        ...defaultArticle,
        tags
      };
      const stubFindAll = sinon.stub(User, 'findAll')
        .rejects();
      const response = await chai.request(server)
        .post('/api/v1/articles')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      stubFindAll.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
    it('should not POST article token is not provided', async () => {
      const response = await chai.request(server)
        .post('/api/v1/articles')
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });
  describe('GET /api/v1/articles', () => {
    beforeEach(async () => {
      await deleteTable(Article);
      await createDummyArticles();
    });
    it('should return list of articles token provided', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const response = await chai.request(server)
        .get('/api/v1/articles')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 10);
    });
    it('should return list of articles no token provided', async () => {
      const response = await chai.request(server)
        .get('/api/v1/articles')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 10);
    });
    it('should return error response if an error occurred during get all articles', async () => {
      const stubArticleCount = sinon.stub(Article, 'count')
        .rejects();
      const response = await chai.request(server)
        .get('/api/v1/articles')
        .send();
      stubArticleCount.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
    it('should return an empty list of articles', async () => {
      await deleteTable(Article);
      const response = await chai.request(server)
        .get('/api/v1/articles')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 0);
    });
    it('should return list of articles with pagination', async () => {
      let response = await chai.request(server)
        .get('/api/v1/articles?page=1&size=3')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 3);

      response = await chai.request(server)
        .get('/api/v1/articles?page=4&size=3')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 1);

      response = await chai.request(server)
        .get('/api/v1/articles?page=90&size=3')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 1);

      response = await chai.request(server)
        .get('/api/v1/articles?page=0&size=0')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertArrayResponse(response, 10);
    });
    it('should return 400 if invalid query is provided', async () => {
      const baseUrl = '/api/v1/articles';
      let response = await chai.request(server)
        .get(`${baseUrl}?page=-2&size=2`)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await chai.request(server)
        .get(`${baseUrl}?page=2&size=-2`)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await chai.request(server)
        .get(`${baseUrl}?page=ihh&size=2`)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);

      response = await chai.request(server)
        .get(`${baseUrl}?page=2&size=mnnjk`)
        .send();
      assertResponseStatus(response, 400);
      assertErrorResponse(response);
    });
  });
  describe('PUT /api/v1/articles/:slug', () => {
    beforeEach(async () => {
      await deleteTable(Article);
    });
    it('should not PUT article with invalid input', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      await validateArticleInput('/api/v1/articles/dummy-slug', jwt, true);
    });
    it('should not modify article when I have not authored', async () => {
      let article = await Article.create({
        ...defaultArticle,
        slug: 'dummy-slug'
      });
      article.setUser(user2);

      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);

      article = (article.dataValues);
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should modify article I have authored', async () => {
      let user = user1;
      const tags = [
        {
          name: 'mocha-test',
        },
        {
          name: 'reactjs',
        }];

      let article = await Article.create({
        ...defaultArticle,
        slug: 'dummy-slug-article',
        tags
      }, {
        include: [{
          model: Tag,
          as: 'tags'
        }]
      });
      article.setUser(user);

      const updateTag = [tags[0].name, tags[1].name, 'chaijs'];
      user = user.dataValues;
      const jwt = Authorization.generateToken(user);

      article = article.dataValues;
      const update = {
        title: `mod ${article.title}`,
        body: `mod ${article.body}`,
        tags: updateTag,
      };
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 200);
      assertArticleResponse(response, { ...article, ...update }, user, updateTag);
    });
    it('should return 404 if article does not exist', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const response = await chai.request(server)
        .put('/api/v1/articles/update-deleted-article')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ ...defaultArticle });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not PUT article token is not provided', async () => {
      const response = await chai.request(server)
        .put('/api/v1/articles')
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });
  describe('DELETE /api/v1/articles/:slug', () => {
    beforeEach(async () => {
      await deleteTable(Article);
    });
    it('should delete article author by user', async () => {
      let user = user1;
      const slug = 'dummy-slug-article';
      let article = await Article.create({
        ...defaultArticle,
        slug,
        tags: [{ name: 'delete-article' }]
      }, {
        include: [{
          model: Tag,
          as: 'tags'
        }]
      });
      article.setUser(user);

      user = user.dataValues;
      const jwt = Authorization.generateToken(user);
      article = article.dataValues;

      const response = await chai.request(server)
        .delete(`/api/v1/articles/${article.slug}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 200);
      article = await Article.findOne({ where: { slug } });
      assertTrue(article === null);
    });
    it('should not delete article not authored by user', async () => {
      const slug = 'deleted-slugged-article';
      const article = await Article.create({
        ...defaultArticle,
        slug
      });
      article.setUser(user2);
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const response = await chai.request(server)
        .delete('/api/v1/articles/deleted-slugged-article')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should return 404 when article with the given if does not exists', async () => {
      const user = user1.dataValues;
      const jwt = Authorization.generateToken(user);
      const response = await chai.request(server)
        .delete('/api/v1/articles/delete-deleted-article')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not DELETE article token is not provided', async () => {
      const response = await chai.request(server)
        .delete('/api/v1/articles')
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });
  describe('GET /api/v1/articles/:slug', () => {
    beforeEach(async () => {
      await deleteTable(Article);
      await createDummyArticles();
    });
    it('should get authors article', async () => {
      const articles = await Article.findAll({
        include: [{
          model: User,
          as: 'user',
        }]
      });

      let article = articles[0];
      const { user } = article;

      article = article.dataValues;
      const response = await chai.request(server)
        .get(`/api/v1/articles/${article.slug}`)
        .send();
      assertResponseStatus(response, 200);
      assertArticleResponse(response, article, user.dataValues, null);
    });

    it('should return 404 error for invalid slug', async () => {
      const response = await chai.request(server)
        .get('/api/v1/articles/23sdsdc-we3we')
        .send();
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });
  describe('PUT /api/v1/articles/:slug/disable', () => {
    let article;
    beforeEach(async () => {
      await deleteTable(Article);
      article = await Article.create({
        ...defaultArticle,
        slug: 'dummy-slug'
      });
      article.setUser(user2);
    });
    it('should allow users with a \'admin\' role disable an article', async () => {
      const jwt = Authorization.generateToken(admin);
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}/disable`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 200);
    });

    it('should not allow users with a \'user\' role to disable an article', async () => {
      const jwt = Authorization.generateToken(user1);
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}/disable`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 401);
      assertErrorResponse(response);
    });

    it('should return 404 if article does not exist', async () => {
      const jwt = Authorization.generateToken(admin);
      const response = await chai.request(server)
        .put('/api/v1/articles/update-deleted-article/disable')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });
});
