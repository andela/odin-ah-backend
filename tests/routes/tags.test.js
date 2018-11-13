import chai from 'chai';
import sinon from 'sinon';
import db from '../../models';
import { assertResponseStatus, deleteTable } from '../testHelpers';
import { createDummyArticles } from '../testHelpers/articleUtil';
import { realUser2 } from '../testHelpers/testLoginData';
import server from '../../index';

const {
  Article, Tag, ArticleTag, User
} = db;
describe('Tags Endpoint', () => {
  before(async () => {
    deleteTable(ArticleTag);
    deleteTable(Tag);
    deleteTable(Article);
    const [user, tag1] = await Promise.all([
      User.create(({
        ...realUser2,
        isVerified: true,
        role: 'user'
      })),
      Tag.create({ name: 'Test tag 1' }),
      Tag.create({ name: 'Test tag 2' })]);
    const [articles1] = await Promise.all([createDummyArticles(user)]);
    const promise = articles1.map(async (article) => {
      await article.addTags([tag1]);
    });
    await Promise.all([promise]);
  });
  it('should get list of popular tags', async () => {
    const response = await chai.request(server)
      .get('/api/v1/tags/popular')
      .send({});
    assertResponseStatus(response, 200);
  });

  it('should get list of tags', async () => {
    let response = await chai.request(server)
      .get('/api/v1/tags')
      .send({});
    assertResponseStatus(response, 200);
    response = await chai.request(server)
      .get('/api/v1/tags?filter=Test')
      .send({});
    assertResponseStatus(response, 200);
  });

  it('should return 400 when provided with invalid filter', async () => {
    const response = await chai.request(server)
      .get('/api/v1/tags?filter=')
      .send({});
    assertResponseStatus(response, 400);
  });

  it('should return 500 error when error occured', async () => {
    const stubTagFindAll = sinon.stub(Tag, 'findAll')
      .rejects();
    const response = await chai.request(server)
      .get('/api/v1/tags/popular')
      .send({});
    assertResponseStatus(response, 500);
    stubTagFindAll.restore();
  });
  it('should return 500 error when error occured', async () => {
    const stubTagFindAll = sinon.stub(Tag, 'findAll')
      .rejects();
    const response = await chai.request(server)
      .get('/api/v1/tags')
      .send({});
    assertResponseStatus(response, 500);
    stubTagFindAll.restore();
  });
});
