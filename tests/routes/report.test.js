

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import db from '../../models/index';
import Authorization from '../../middlewares/Authorization';

let Slug;
let accessToken;
chai.use(chaiHttp);
chai.should();

const { User } = db;
describe('Report articles', () => {
  before('Login a user', (done) => {
    User.create({ username: 'lameda', email: 'hammed@andela.com', password: 'password' }).then((user) => {
      accessToken = Authorization.generateToken(user);
      done();
    });
  });
  before('create article', (done) => {
    chai.request(server)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer: ${accessToken}`)
      .send({
        body: 'bluh bluh bluh',
        title: 'firts article',
        description: 'bluh bluh blug hshshshshsh'
      })
      .end((err, res) => {
        Slug = res.body.article.slug;
        done();
      });
  });
  describe('/api/v1/report/articles/', () => {
    it('should able to report an article ', (done) => {
      chai.request(server)
        .post(`/api/v1/report/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({
          reportType: 'spam',
          description: 'gsgsgsgsgsgggssgsgsggsgsgsgsg'
        })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should not able to report an article already reported by the same author', (done) => {
      chai.request(server)
        .post(`/api/v1/report/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({
          reportType: 'plagiarism',
          description: 'gsgsgsgsgsgggssgsgsggsgsgsgsg'
        })
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should not be able to report an article without type or description', (done) => {
      chai.request(server)
        .post(`/api/v1/report/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should  not be able to report articles not existing', (done) => {
      chai.request(server)
        .post(`/api/v1/report/articles/${Slug}`)
        .set('Authorization', 'Bearer: wrongtoken')
        .send({})
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should  not be able to report articles not existing', (done) => {
      chai.request(server)
        .post('/api/v1/report/articles/not-existing-slug')
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({
          reportType: 'plagiarism',
          description: 'gsgsgsgsgsgggssgsgsggsgsgsgsg'
        })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should  not be able to report articleswhen reportType value is wrong', (done) => {
      chai.request(server)
        .post(`/api/v1/report/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({
          reportType: 'wrongValue',
          description: 'gsgsgsgsgsgggssgsgsggsgsgsgsg'
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should returns articles reported articles', (done) => {
      chai.request(server)
        .get('/api/v1/report/articles?page=1&size=3')
        .set('Authorization', `Bearer: ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          res.should.be.an('object');
          res.body.data.reports.should.be.an('array');
          done();
        });
    });
  });
});
