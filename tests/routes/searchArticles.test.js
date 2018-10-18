import chai from 'chai';
import sinon from 'sinon';
import server from '../../index';
import db from '../../models';
import { defaultArticle, createDummyArticles } from '../testHelpers/articleUtil';
import { realUser1, realUser2 } from '../testHelpers/testLoginData';
import Authorization from '../../middlewares/Authorization';
import { deleteTable } from '../testHelpers';

const { expect } = chai;
const {
  Article, User, Tag, sequelize
} = db;

describe('GET /search', () => {
  beforeEach(async () => {
    await Promise.all([
      deleteTable(Article), deleteTable(User), deleteTable(Tag)
    ]);
  });

  after(async () => {
    await Promise.all([deleteTable(Tag), deleteTable(Article)]);
  });

  it('should return 400 bad request if no query is specified', async () => {
    const response = await chai.request(server).get('/api/v1/search');
    expect(response).to.have.status(400);
  });

  it('should return 400 bad request if an empty string is set as search query', async () => {
    const response = await chai.request(server).get('/api/v1/search?q= ');
    expect(response).to.have.status(400);
  });

  it('should return an empty array when there are no articles in the database', async () => {
    const response = await chai.request(server).get('/api/v1/search?q=random+search+query');
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('Object');
    expect(response.body.results).to.be.an('Array');
    expect(response.body.results.length).to.eql(0);
  });

  it("should return a non-empty array when there's a match for the search query", async () => {
    const article = await Article.create({ ...defaultArticle, slug: 'some-article-slug' });
    const { id: articleIdInDb } = article;
    const response = await chai.request(server).get('/api/v1/search?q=train+dragon');
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('Object');
    expect(response.body.results).to.be.an('Array');
    expect(response.body.results.length).to.be.greaterThan(0);
    const { id: articleIdInResponse } = response.body.results[0];
    expect(articleIdInDb).to.eql(articleIdInResponse);
  });

  it('should return a paginated list of matching articles', async () => {
    await createDummyArticles(); // creates 10 articles
    const response = await chai.request(server).get('/api/v1/search?q=train+dragon&limit=2&page=1');
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('Object');
    expect(response.body.results).to.be.an('Array');
    expect(response.body.results.length).to.be.equal(2);
  });

  it('should return a list of articles written by only a specific author', async () => {
    const firstAuthorPromise = User.create({ ...realUser1, isVerified: true });
    const secondAuthorPromise = User.create({ ...realUser2, isVerified: true });
    await Promise.all([firstAuthorPromise, secondAuthorPromise]);
    const usersPromise = User.findAll();
    const articlesPromise = createDummyArticles(); // create 10 articles assigned to expected author
    const [users] = await Promise.all([usersPromise, articlesPromise]);
    const expectedArticleOwner = users[0].dataValues;
    const { id: authorId } = expectedArticleOwner;
    const response = await chai
      .request(server)
      .get(`/api/v1/search?q=train+dragon&limit=10&page=1&author=${authorId}`);
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('Object');
    expect(response.body.results).to.be.an('Array');
    expect(response.body.results.length).to.be.equal(10);
    response.body.results.forEach((article) => {
      expect(article.authorId).to.eql(authorId);
    });
  });

  it('should return a list of articles with specific tags', async () => {
    const firstAuthorPromise = User.create({ ...realUser1, isVerified: true });
    const secondAuthorPromise = User.create({ ...realUser2, isVerified: true });
    await Promise.all([firstAuthorPromise, secondAuthorPromise]);
    const dummyArticlesPromise1 = createDummyArticles(0);
    const dummyArticlesPromise2 = createDummyArticles(1);
    const usersPromise = User.findAll();
    const [users] = await Promise.all([usersPromise, dummyArticlesPromise1, dummyArticlesPromise2]);
    const user = users[1].dataValues;
    const jwt = Authorization.generateToken(user);
    const tags = ['chai', 'promise'];
    const article = {
      ...defaultArticle,
      slug: 'some-crappy-article',
      tags
    };
    await chai
      .request(server)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer ${jwt}`)
      .send(article);
    const dbTags = await Tag.findAll();
    const { id: tagId } = dbTags[0].dataValues;
    const response = await chai
      .request(server)
      .get(`/api/v1/search?q=train+dragon&limit=10&page=1&tag=${tagId}`);
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('Object');
    expect(response.body.results).to.be.an('Array');
    expect(response.body.results.length).to.be.equal(1);
  });

  it('should return 500 internal error when a database error occurs', async () => {
    const sequelizeQueryStub = sinon.stub(sequelize, 'query').rejects();
    const response = await chai.request(server).get('/api/v1/search?q=train+dragon');
    expect(response).to.have.status(500);
    expect(response.body).to.be.an('Object');
    sequelizeQueryStub.restore();
  });
});
