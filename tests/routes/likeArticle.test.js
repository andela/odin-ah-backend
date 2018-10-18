

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
describe('Like or Dislike', () => {
  before('Login a user', (done) => {
    User.create({ username: 'hammed', email: 'hammed.noibi@andela.com', password: 'password' })
      .then((user) => {
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
  describe('Like controller', () => {
    it('should able to like an article ', (done) => {
      chai.request(server)
        .post(`/api/v1/articles/likes/${Slug}/like`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.have.property('status');
          res.body.should.have.property('message');

          done();
        });
    });
    it('should be able to dislike an article', (done) => {
      chai.request(server)
        .post(`/api/v1/articles/likes/${Slug}/dislike`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should be able to stay neutral', (done) => {
      chai.request(server)
        .post(`/api/v1/articles/likes/${Slug}/neutral`)
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should not be able like article not available', (done) => {
      chai.request(server)
        .post('/api/v1/articles/likes/dummy-slug-134/dislike')
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
    it('should not be able like article not available', (done) => {
      chai.request(server)
        .post('/api/v1/articles/likes/dummy-slug-134/anythingelse')
        .set('Authorization', `Bearer: ${accessToken}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('status');
          res.body.should.have.property('message');
          done();
        });
    });
  });
});
