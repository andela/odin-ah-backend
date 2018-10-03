import chai from 'chai';
import chaiHtpp from 'chai-http';
import server from '../..';
import verificationToken from '../../helpers/verificationToken';

chai.use(chaiHtpp);
const { expect } = chai;

describe('POST /api/v1/auth/signup ', () => {
  const userInfo = {
    username: 'hnobi',
    email: 'hnobi08@gmail.com',
    password: '12345678'
  };
  const token = verificationToken();
  it('should create a new user account and return a `201`', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send(userInfo)
      .end((err, res) => {
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Please check your Email for account confirmation');
        done();
      });
  });
  it('should  return error for existing user with `400`', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send(userInfo)
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('user with email hnobi08@gmail.com already have Authors haven account');
        done();
      });
  });
  it('should return a error message when Email is empty return a `400`', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send({
        username: 'hnobi',
        email: '',
        password: '12345678',
        token
      })
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('Email can not be empty');
        done();
      });
  });
  it('should return a error message when password is empty return a `400`', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send({
        username: 'hnobi',
        email: 'hnobi08@gmail.com',
        password: '',
        token
      })
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('Password can not be empty');
        done();
      });
  });
  it('should only take password lenght of 8 and greater than 8 `400`', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send({
        username: 'hnobi',
        email: 'hnobi08@gmail.com',
        password: 'dggdg',
        token
      })
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('Password must be greater than eight characters');
        done();
      });
  });
  it('should verify user token with token generated from user email and return error', (done) => {
    chai.request(server)
      .get('/api/v1/auth/confirmation/3')
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('invalid verification link');
        done();
      });
  });
});
