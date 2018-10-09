import chai, { expect } from 'chai';
import server from '../../index';
import { realUser } from '../testHelpers/testLoginData';
import db from '../../models';
import eventBus from '../../helpers/eventBus';

const { User } = db;

describe('POST /auth/confirmation', () => {
  before('Create a user Account', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send(realUser)
      .end(() => {
        done();
      });
  });

  it('should return 200 ok after resending confirmation link to user email', (done) => {
    let spyFunctionWasCalled = false;
    const spyFunction = () => {
      spyFunctionWasCalled = true;
    };
    eventBus.on('resendEmail', spyFunction);
    User.update({ isVerified: false }, { where: { email: realUser.email } }).then(() => {
      chai
        .request(server)
        .post('/api/v1/auth/confirmation')
        .send({ email: realUser.email })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(spyFunctionWasCalled).to.eql(true);
          done();
        });
    });
  });

  it('should return 404 not found when unregistered user requests confirmation link', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/confirmation')
      .send({ email: 'nouser@nomail.com' })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should return 403 forbidden error when already verified user requests confirmation link', (done) => {
    User.update({ isVerified: true }, { where: { email: realUser.email } }).then(() => {
      chai
        .request(server)
        .post('/api/v1/auth/confirmation')
        .send({ email: realUser.email })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  it('should return 400 bad request when user submits an invalid email', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/confirmation')
      .send({ email: 'invalid' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});
