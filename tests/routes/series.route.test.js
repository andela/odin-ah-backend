import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import db from '../../models';
import Authorization from '../../middlewares/Authorization';
import server from '../../index';
import { realUser, realUser1 } from '../testHelpers/testLoginData';
import { AUTHORIZATION_HEADER, MAX_INT } from '../../helpers/constants';
import {
  assertArticleResponse,
  defaultArticle,
  validateArticleInput
} from '../testHelpers/articleUtil';
import {
  assertErrorResponse,
  assertResponseStatus,
  assertTrue,
  deleteTable,
  getRequest
} from '../testHelpers';
import Util from '../../helpers/Util';
import SeriesHelper from '../../helpers/SeriesHelper';
import TagHelper from '../../helpers/TagHelper';
import {
  assertMultipleSeriesResponse,
  assertSeriesResponseData,
  createDummySeries,
  seriesContent
} from '../testHelpers/seriesUtil';

const {
  Article, User, Tag, Series, SeriesTags, sequelize
} = db;

chai.use(chaiHttp);
chai.should();

describe('Series CRUD Test', () => {
  let user1, user2, jwt, jwt2;
  before(async () => {
    await deleteTable(User);
    [user1, user2] = await Promise.all([
      User.create({
        ...realUser,
        isVerified: true
      }),
      User.create({
        ...realUser1,
        isVerified: true
      })]);
    jwt = Authorization.generateToken(user1);
    jwt2 = Authorization.generateToken(user2);
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
      await deleteTable(Tag);
      await deleteTable(Article);
      await deleteTable(Series);
    });
    it('should have a valid input', async () => {
      const url = '/api/v1/series';
      let response0 = await getRequest(url, jwt, false)
        .send({
          title: '        ',
          description: 'Ever wonder how?'
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, false)
        .send({
          description: 'Ever wonder how?'
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, false)
        .send({
          title: 'Ever wonder how?',
          description: '   '
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, false)
        .send({
          title: 'Ever wonder how?',
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, false)
        .send({
          title: 'Ever wonder how?',
          description: 'Ever wonder how?',
          imageUrl: '      ',
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);


      response0 = await getRequest(url, jwt, false)
        .send({
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          imageUrl: 'http://localhost:3000',
          tags: 'eesff '
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);

      response0 = await getRequest(url, jwt, false)
        .send({
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          imageUrl: 'http://localhost:3000',
          tags: ['eesff ', '            ']
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
    });
    it('should create new series for logged in user with tags', async () => {
      const tags = ['NodeJS', 'ChaiJS'];
      const series = {
        ...seriesContent,
        tags
      };
      const response = await chai.request(server)
        .post('/api/v1/series')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(series);
      assertResponseStatus(response, 201);
      assertSeriesResponseData(response, series, user1, tags, 0);
    });
    it('should create new series for logged in user without tags', async () => {
      const response = await chai.request(server)
        .post('/api/v1/series')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({
          ...seriesContent
        });
      assertResponseStatus(response, 201);
      assertSeriesResponseData(response, seriesContent, user1, null, 0);
    });
    it('should throw an error if there was an error creating a series', async () => {
      const stubFindAll = sinon.stub(User, 'findAll')
        .rejects();
      const response = await chai.request(server)
        .post('/api/v1/series')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ ...seriesContent });
      stubFindAll.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
    it('should not POST article token is not provided', async () => {
      const response = await chai.request(server)
        .post('/api/v1/series')
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });

  describe('POST /api/v1/series/:slug/add/articles', () => {
    let url;
    beforeEach(async () => {
      await deleteTable(Tag);
      await deleteTable(Article);
      await deleteTable(Series);
      const series = {
        slug: 'ever-wonder-how-nsjinw4ed',
        title: 'Ever wonder how?',
        description: 'Ever wonder how?',
        imageUrl: 'http://localhost:3000/path/to/my/awesome/series/cover.jpeg',
      };
      const authorSeries = await Series.create({ ...series })
        .then(result => result.setUser(user1));

      url = `/api/v1/series/${authorSeries.slug}/add/articles`;
    });
    it('should have a valid input', async () => {
      await validateArticleInput(url, jwt, false);
    });
    it('should create new article for logged in user', async () => {
      const tags = ['nodejs', 'mocha'];
      const article = {
        ...defaultArticle,
        tags
      };
      const response = await chai.request(server)
        .post(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      assertResponseStatus(response, 201);
      assertArticleResponse(response, article, user1, tags);
    });
    it('should throw an error if there was an error creating an article', async () => {
      const tags = ['nodejs', 'mocha'];
      const article = {
        ...defaultArticle,
        tags
      };
      const stubFindAll = sinon.stub(User, 'findAll')
        .rejects();
      const response = await chai.request(server)
        .post(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(article);
      stubFindAll.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
    it('should not add articles to a series when I have not authored', async () => {
      const tags = ['nodejs', 'mocha'];
      const article = {
        ...defaultArticle,
        tags
      };

      const response = await chai.request(server)
        .post(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt2}`)
        .send(article);
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should not POST article token is not provided', async () => {
      const response = await chai.request(server)
        .post(url)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });

  describe('DELETE /api/v1/series/:slug', () => {
    let series, url, article;
    beforeEach(async () => {
      await Promise.all([deleteTable(Tag), deleteTable(Article), deleteTable(Series)]);
      [series] = await Promise.all([
        createDummySeries(user1), createDummySeries(user2)
      ]);
      url = `/api/v1/series/${series.slug}`;
      article = await Article.create({
        ...defaultArticle,
        slug: Util.createSlug(defaultArticle.title),
        tags: [{ name: 'delete-article-tag' }]
      }, {
        include: [{
          model: Tag,
          as: 'tags'
        }]
      })
        .then(a => a.setSeries(series));
    });
    it('should have a valid input', async () => {
      const response0 = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ deleteContents: 'mnbgtyuikjmnhy' });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
    });
    it('should delete series only', async () => {
      const tags = await TagHelper.findOrCreateTags(['tag1', 'tag2']);
      const tagIds = tags.map(item => item.dataValues.id);
      await series.addTags(tags);
      const findSeries = await Series.findOne({
        where: { slug: series.slug },
        include: [{
          model: Article,
          as: 'articles'
        }]
      });
      const articleIds = findSeries.articles.map(item => item.id);
      const response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ deleteContents: false });
      assertResponseStatus(response, 200);

      const seriesTags = await SeriesTags.findAll({
        where: {
          tagId: {
            [sequelize.Op.in]: tagIds
          },
          seriesId: series.id,
        }
      });

      assertTrue(seriesTags.length === 0);

      const articles = await Article.findAll({ where: { id: articleIds } });
      assertTrue(articles.length === 6);
      series = await Series.findOne({ where: { slug: series.slug } });
      assertTrue(series === null);
    });
    it('should delete series and the associated articles in the series', async () => {
      const response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ deleteContents: true });
      assertResponseStatus(response, 200);
      const total = await Article.count({ where: { seriesId: series.id } });
      article = await Article.findOne({ where: { slug: article.slug } });
      series = await Series.findOne({ where: { slug: series.slug } });
      assertTrue(total === 0);
      assertTrue(article === null);
      assertTrue(series === null);
    });
    it('should not delete series not authored by user', async () => {
      const response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt2}`)
        .send({ deleteContents: true });
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should return 404 when the series does not exists', async () => {
      await deleteTable(Series);
      const response = await chai.request(server)
        .delete(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ deleteContents: true });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not DELETE series token is not provided', async () => {
      const response = await chai.request(server)
        .delete(url)
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });

  describe('GET /api/v1/series', () => {
    beforeEach(async () => {
      await deleteTable(Article);
      await deleteTable(Series);
      await Promise.all([
        createDummySeries(user1), createDummySeries(user2)
      ]);
    });
    it('should return list of series token provided', async () => {
      const response = await chai.request(server)
        .get('/api/v1/series')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send();
      assertResponseStatus(response, 200);
      assertMultipleSeriesResponse(response, 2, 5);
    });
    it('should return list of series no token provided', async () => {
      const response = await chai.request(server)
        .get('/api/v1/series')
        .send();
      assertResponseStatus(response, 200);
      assertMultipleSeriesResponse(response, 2, 5);
    });
    it('should return error response if an error occurred during get all series', async () => {
      const stubArticleCount = sinon.stub(Series, 'count')
        .rejects();
      const response = await chai.request(server)
        .get('/api/v1/series')
        .send();
      stubArticleCount.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });
    it('should return an empty list of series', async () => {
      await deleteTable(Series);
      const response = await chai.request(server)
        .get('/api/v1/series')
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertMultipleSeriesResponse(response);
    });
    it('should return 400 if invalid query is provided', async () => {
      const baseUrl = '/api/v1/series';
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

  describe('GET /api/v1/series/:slug', () => {
    let series1, series2;
    beforeEach(async () => {
      await deleteTable(Article);
      [series1, series2] = await Promise.all([
        createDummySeries(user1, 28), createDummySeries(user2, 0)
      ]);
    });
    it('should get authors series with articles', async () => {
      let response = await chai.request(server)
        .get(`/api/v1/series/${series1.slug}`)
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertSeriesResponseData(response, series1, user1, null, 20);
      response = await chai.request(server)
        .get(`/api/v1/series/${series1.slug}?page=2&size=25`)
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertSeriesResponseData(response, series1, user1, null, 3);
    });
    it('should get authors series without articles', async () => {
      const response = await chai.request(server)
        .get(`/api/v1/series/${series2.slug}`)
        .send();
      assertResponseStatus(response, 200);
      assertSeriesResponseData(response, series2, user2, null, 0);
    });
    it('should return 404 error for invalid slug', async () => {
      const response = await chai.request(server)
        .get('/api/v1/series/23sdsdc-we3we')
        .send();
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });

  describe('GET /api/v1/me/series', () => {
    const url = '/api/v1/me/series';
    beforeEach(async () => {
      await deleteTable(Article);
      await deleteTable(Series);
      await Promise.all([createDummySeries(user1, 20), createDummySeries(user2, 10)]);
    });

    it('should return list of articles for the authenticated user', async () => {
      const response = await chai.request(server)
        .get(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send();
      assertResponseStatus(response, 200);
      response.body.should.be.a('object');
      assertMultipleSeriesResponse(response, 1, 20);
    });

    it('should return error response if an error occurred during get all series', async () => {
      const stubArticleCount = sinon.stub(Series, 'count')
        .rejects();
      const response = await chai.request(server)
        .get(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send();
      stubArticleCount.restore();
      assertResponseStatus(response, 500);
      assertErrorResponse(response);
    });

    it('should not GET series token is not provided', async () => {
      const response = await chai.request(server)
        .get(url)
        .send();
      assertResponseStatus(response, 401);
    });
  });

  describe('PUT /api/v1/series/:slug', () => {
    let series, url;
    beforeEach(async () => {
      await deleteTable(Tag);
      await deleteTable(Article);
      await deleteTable(Series);
      [series] = await Promise.all([
        createDummySeries(user1),
        createDummySeries(user2)
      ]);
      url = `/api/v1/series/${series.slug}`;
    });
    it('should not PUT series with invalid input', async () => {
      let response0 = await getRequest(url, jwt, true)
        .send({
          title: '        ',
          description: 'Ever wonder how?'
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, true)
        .send({
          title: 'Ever wonder how?',
          description: '              '
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, true)
        .send({
          title: 'Ever wonder how?',
          imageUrl: '              '
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
      response0 = await getRequest(url, jwt, true)
        .send({
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          imageUrl: 'http://localhost:3000',
          tags: 'eesff '
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);

      response0 = await getRequest(url, jwt, true)
        .send({
          title: 'How to train your dragon',
          description: 'Ever wonder how?',
          imageUrl: 'http://localhost:3000',
          tags: ['eesff ', '            ']
        });
      assertResponseStatus(response0, 400);
      assertErrorResponse(response0);
    });
    it('should not modify series when I have not authored', async () => {
      const response = await chai.request(server)
        .put(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt2}`)
        .send({ ...seriesContent });
      assertResponseStatus(response, 403);
      assertErrorResponse(response);
    });
    it('should modify series I have authored', async () => {
      const tagList = ['mocha-test', 'reactjs'];
      const tags = await TagHelper.findOrCreateTags(tagList);
      await series.addTags(tags);

      url = `/api/v1/series/${series.slug}`;

      let update = {
        description: `mod ${seriesContent.description}`,
      };
      let response = await chai.request(server)
        .put(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 200);
      response.body.should.have.property('series');
      response.body.series.should.have.property('description')
        .eq(update.description);

      const updateTags = [...tagList, 'updatetag'];
      update = {
        ...seriesContent,
        title: `mod ${seriesContent.title}`,
        description: `mod ${seriesContent.description}`,
        tags: updateTags
      };
      response = await chai.request(server)
        .put(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 200);
      assertSeriesResponseData(response, update, user1, updateTags, 0);
    });
    it('should return 404 if series does not exist', async () => {
      const response = await chai.request(server)
        .put('/api/v1/series/update-deleted-series')
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send({ ...defaultArticle });
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
    it('should not PUT series token is not provided', async () => {
      const response = await chai.request(server)
        .put('/api/v1/series')
        .send(defaultArticle);
      assertResponseStatus(response, 401);
    });
  });

  describe('PUT /api/v1/articles/:slug', () => {
    let series, article, url;
    beforeEach(async () => {
      await deleteTable(Tag);
      await deleteTable(Article);
      await deleteTable(Series);
      const tags = [
        {
          name: 'mocha-test',
        },
        {
          name: 'reactjs',
        }];
      series = await createDummySeries(user1, 0);
      article = await Article.create({
        ...defaultArticle,
        slug: Util.createSlug(defaultArticle.title),
        tags
      }, {
        include: [{
          model: Tag,
          as: 'tags'
        }]
      });
      await article.setUser(user1);
      url = `/api/v1/articles/${article.slug}`;
    });
    it('should not PUT article with invalid input', async () => {
      const response2 = await getRequest(url, jwt, true)
        .send({
          title: 'my lovely article',
          description: 'Ever wonder how?',
          body: 'It takes a Jacobian',
          seriesId: 'kjhgf'
        });
      assertResponseStatus(response2, 400);
      assertErrorResponse(response2);
    });
    it('should update and add article to a given series', async () => {
      const update = {
        title: `mod ${article.title}`,
        body: `mod ${article.body}`,
        seriesId: series.id,
      };
      const response = await chai.request(server)
        .put(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 200);
      assertArticleResponse(response, { ...article.dataValues, ...update }, user1);
      series = await SeriesHelper.findSeriesBySlug(series.slug);
      assertTrue(series.articles.length === 1);
    });
    it('should return 404 if series does not ', async () => {
      const update = {
        title: `mod ${article.title}`,
        body: `mod ${article.body}`,
        seriesId: MAX_INT,
      };
      const response = await chai.request(server)
        .put(url)
        .set(AUTHORIZATION_HEADER, `Bearer ${jwt}`)
        .send(update);
      assertResponseStatus(response, 404);
      assertErrorResponse(response);
    });
  });
});
