import chai from 'chai';
import chaiHttp from 'chai-http';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { realUser, realUser1 } from '../testHelpers/testLoginData';
import Util from '../../helpers/Util';
import { AUTHORIZATION_HEADER } from '../../helpers/constants';
import {
  assertArrayResponse,
  assertArticleResponse,
  assertErrorResponse,
  assertResponseStatus, assertTrue, createDummyArticles,
  defaultArticle,
  deleteArticlesFromTable,
  validateArticleInput
} from '../testHelpers/articleUtil';

const { Article, User } = db;

chai.use(chaiHttp);
chai.should();

describe('Article CRUD Test', () => {
  before(async () => {
    await User.destroy({
      truncate: true,
      cascade: true
    });
    await Promise.all([User.create(realUser), User.create(realUser1)]);
  });
  describe('POST /api/v1/articles', () => {
    beforeEach(async () => {
      await deleteArticlesFromTable();
    });
    it('should have a valid input', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
      await validateArticleInput('/api/v1/articles', jwt, false);
    });
    it('should return 409 if article already exists', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      let article = {
        ...defaultArticle,
        slug: Util.createSlug(user.username, defaultArticle.title)
      };

      article = await Article.create(article);
      await article.setUser(users[0]);
      const jwt = Authorization.generateToken(user.id);
      const response = await chai.request(server)
        .post('/api/v1/articles')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ ...defaultArticle });
      assertResponseStatus(response, 409);
      assertErrorResponse(response);
    });
    it('should create new article for logged in user', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
      const article = {
        ...defaultArticle,
      };
      const response = await chai.request(server)
        .post('/api/v1/articles')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      assertResponseStatus(response, 201);
      assertArticleResponse(response, article, user);
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
      await deleteArticlesFromTable();
      await createDummyArticles();
    });
    it('should return list of articles token provided', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
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
    it('should return an empty list of articles', async () => {
      await deleteArticlesFromTable();
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
    it('should return 400 if valid query is provided', async () => {
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
      await deleteArticlesFromTable();
    });
    it('should not PUT article with invalid input', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
      await validateArticleInput('/api/v1/articles/dummy-slug', jwt, true);
    });
    it('should not modify article when I have not authored', async () => {
      const users = await User.findAll();

      let article = await Article.create({
        ...defaultArticle,
        slug: 'dummy-slug'
      });
      article.setUser(users[1]);

      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);

      article = (article.dataValues);
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should modify article I have authored', async () => {
      const users = await User.findAll();
      let user = users[0];

      let article = await Article.create({
        ...defaultArticle,
        slug: 'dummy-slug-article',
      });
      article.setUser(user);

      user = user.dataValues;
      const jwt = Authorization.generateToken(user.id);

      article = article.dataValues;
      const update = {
        title: `mod ${article.title}`,
        body: `mod ${article.body}`,
      };
      const response = await chai.request(server)
        .put(`/api/v1/articles/${article.slug}`)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 200);
      assertArticleResponse(response, { ...article, ...update }, user);
    });
    it('should return 404 if article does not exist', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
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
      await deleteArticlesFromTable();
    });
    it('should delete article author by user', async () => {
      const users = await User.findAll();
      let user = users[0];
      const slug = 'dummy-slug-article';
      let article = await Article.create({
        ...defaultArticle,
        slug
      });
      article.setUser(user);

      user = user.dataValues;
      const jwt = Authorization.generateToken(user.id);
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
      const users = await User.findAll();
      const slug = 'deleted-slugged-article';
      const article = await Article.create({
        ...defaultArticle,
        slug
      });
      article.setUser(users[1]);
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
      const response = await chai.request(server)
        .delete('/api/v1/articles/deleted-slugged-article')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({});
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should return 404 when article with the given if does not exists', async () => {
      const users = await User.findAll();
      const user = users[0].dataValues;
      const jwt = Authorization.generateToken(user.id);
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
      await deleteArticlesFromTable();
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
});
