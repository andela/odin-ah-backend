

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
describe('Bookmark', () => {
  before('Login a user', (done) => {
    User.create({ username: 'hammed', email: 'hammed.noibi@andela.com', password: 'password' }).then((user) => {
      accessToken = Authorization.generateToken(user);
      done();
    });
  });
  before('create article', (done) => {
    chai.request(server)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer: ${accessToken}`)
      .send({
        body: 'hbdbdb dbbdtttttbdbbdbdd',
        title: 'firts article',
        description: 'aertttttsjjhhshshshshsh'
      })
      .end((err, res) => {
        Slug = res.body.article.slug;
        done();
      });
  });
  describe('Bookmark controller', () => {
    it('should able to bookmark an article ', (done) => {
      chai.request(server)
        .post(`/api/v1/bookmark/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should not be able to bookmark an article already bookmarked by the user', (done) => {
      chai.request(server)
        .post(`/api/v1/bookmark/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should  not be able to bookmark articles not existing', (done) => {
      chai.request(server)
        .post('/api/v1/bookmark/articles/not-existing-slug')
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should returns articles bookmarked by the author', (done) => {
      chai.request(server)
        .get('/api/v1/bookmark/articles?page=1&size=3')
        .set('Authorization', `Bearer: ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          res.should.be.an('object');
          res.body.data.bookmarks.article.should.be.an('array');
          done();
        });
    });
    it('should delete a bookmark', (done) => {
      chai.request(server)
        .delete(`/api/v1/bookmark/articles/${Slug}`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
  });
});
