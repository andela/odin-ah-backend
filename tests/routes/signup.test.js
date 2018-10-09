import chai from 'chai';
import chaiHtpp from 'chai-http';
import sinon from 'sinon';
import server from '../..';
import verificationToken from '../../helpers/verificationToken';
import db from '../../models/index';

chai.use(chaiHtpp);
const { expect } = chai;
const { sequelize, User } = db;

describe('POST /api/v1/auth/signup ', () => {
  const userInfo = {
    username: 'hnobi',
    email: 'hnobi08@gmail.com',
    password: '12345678'
  };
  const token = verificationToken();
  it('should create a new user account and return a `201`', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send(userInfo)
      .end((err, res) => {
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Please check your Email for account confirmation');
        done();
      });
  });
  it('should return error for existing user with `400`', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send(userInfo)
      .end((err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('User already exists. Please login');
        done();
      });
  });
  it('should return a error message when Email is empty return a `400`', (done) => {
    chai
      .request(server)
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
    chai
      .request(server)
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
    chai
      .request(server)
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
  it('should return 200 success when user uses a valid confirmation link', (done) => {
    User.findOne({ where: { email: 'hnobi08@gmail.com' } }).then((user) => {
      const { token: confirmationToken } = user.dataValues;
      chai
        .request(server)
        .get(`/api/v1/auth/confirmation/${confirmationToken}`)
        .end((err, res) => {
          expect(res.status).to.eql(200);
          done();
        });
    });
  });
  it('should return 400 bad request when user uses an invalid confirmation link', (done) => {
    chai
      .request(server)
      .get('/api/v1/auth/confirmation/3')
      .end((err, res) => {
        expect(res.status).to.eql(400);
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('invalid verification link');
        done();
      });
  });
  it('should return 500 server error if user verification could not be updated', (done) => {
    const userStub = sinon.stub(sequelize.Model, 'findOne').rejects();
    chai
      .request(server)
      .get('/api/v1/auth/confirmation/3')
      .end((err, res) => {
        expect(res.status).to.eql(500);
        userStub.restore();
        done();
      });
  });
  it('should return 500 server error if database driver was not able to insert user', (done) => {
    const userStub = sinon.stub(sequelize.Model, 'create').rejects();
    chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send({
        username: 'hnobi2',
        email: 'hnobi09@gmail.com',
        password: '123456789'
      })
      .end((err, res) => {
        expect(res.status).to.equal(500);
        userStub.restore();
        done();
      });
  });
});
