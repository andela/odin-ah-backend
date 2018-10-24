import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../../index';
import db from '../../models';

let accessToken;
let Slug;
chai.use(chaiHttp);
chai.should();

const { User } = db;

let testUser;

describe('Reading statistics', () => {
  before('Create a user Account', async () => {
    testUser = {
      email: 'uche@deind.com',
      username: 'uchechills',
      password: 'chilling',
      isVerified: true
    };
    await User.create(testUser);
  });
  before('Login a user', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(testUser)
      .end((err, response) => {
        const { user } = response.body;
        const { token } = user;
        accessToken = token;
        done();
      });
  });
  before('create article', (done) => {
    chai.request(server)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer: ${accessToken}`)
      .send({
        body: 'Test create article',
        title: 'Some title',
        description: 'Description for test create article'
      })
      .end((err, res) => {
        Slug = res.body.article.slug;
        done();
      });
  });
  before('get article', (done) => {
    chai.request(server)
      .get(`/api/v1/articles/${Slug}`)
      .set('Authorization', `Bearer: ${accessToken}`)
      .send()
      .end(() => {
        done();
      });
  });
  it('should be able to get the reading statistics of a user', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    response.should.have.status(200);
    response.body.should.have.property('message').equal('Reading statistics retrieved Successfully');
  });
  it('should be able to get the filtered reading statistics of a user', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics?startDate=2018-02-02')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    response.should.have.status(200);
    response.body.should.have.property('message').equal('Reading statistics retrieved Successfully');
  });
  it('should return result for tag filter', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics?tag=java')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    response.should.have.status(200);
    response.body.should.have.property('message').equal('Reading statistics retrieved Successfully');
  });
  it('should not return result for invalid start date format', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics?startDate=20')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    response.should.have.status(400);
    response.body.should.have.property('message').equal('Validation error');
    response.body.errors.startDate[0].should.equal('Start date is not valid');
  });
  it('should not return result for invalid end date format', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics?endDate=2018-100-200')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    response.should.have.status(400);
    response.body.should.have.property('message').equal('Validation error');
    response.body.errors.endDate[0].should.equal('End date is not valid');
  });
  it('should return result for valid date format', async () => {
    const response = await chai.request(server)
      .get('/api/v1/users/statistics?startDate=1540285388000&&endDate=1540285388000')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();
    response.should.have.status(400);
    response.body.should.have.property('message').equal('Validation error');
  });
  it('should throw error for unforseen error', async () => {
    const { ReadingStatistics } = db;
    const ReadingStatisticsStub = sinon.stub(ReadingStatistics, 'count').rejects();
    const response = await chai.request(server)
      .get('/api/v1/users/statistics')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    response.should.have.status(500);
    response.body.should.have.property('message');
    ReadingStatisticsStub.restore();
  });
});
