import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../..';
import { user } from '../../helpers/passportMockStrategy';

const { expect } = chai;
chai.use(chaiHttp);

describe('GET /auth/facebook', () => {
  it('should return a JWT when user successfully authenticates', (done) => {
    user.emails = [{ value: 'johndoe@gmail.com' }];
    chai
      .request(server)
      .get('/api/v1/auth/facebook/callback')
      .end((err, res) => {
        expect(res).to.redirect;
        done();
      });
  });
  it('should return a 401 unauthorized error when the user signs up with an account that has no associated email', (done) => {
    user.emails = null;
    chai
      .request(server)
      .get('/api/v1/auth/facebook/callback')
      .end((err, res) => {
        expect(res.status).to.equal(422);
        expect(res.body).to.have.property('errors');
        expect(res.body.errors).to.have.property('message');
        done();
      });
  });

  it('should return a 500 server error message when a database error occurs', (done) => {
    user.emails = [{ value: 'badEmail' }]; // simulating a database error with a bad email
    chai
      .request(server)
      .get('/api/v1/auth/facebook/callback')
      .end((err, res) => {
        expect(res.status).to.equal(500);
        done();
      });
  });
});
