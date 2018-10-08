import chai, { expect } from 'chai';
import server from '../../index';
import db from '../../models';
import {
  realUser,
  wrongEmail,
  emptyEmail,
  wrongLength,
  noPass,
  badEmail,
  realUserWithWrongPassword
} from '../testHelpers/testLoginData';

const { User } = db;

describe('POST /auth/Login', () => {
  before('Create a user Account', async () => {
    await chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send(realUser);
  });

  it('should return a 200 status and a token when a user with verified email logs in', async () => {
    // verify user
    await User.update({ isVerified: true }, { where: { email: realUser.email.toLowerCase() } });
    // log in user
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(realUser);
    expect(response).to.have.status(200);
    expect(response.body.user).to.have.property('token');
    expect(response.body.user.token).that.is.not.equal('');
    expect(response.body.user).to.have.property('imageUrl');
    expect(response.body.user).to.have.property('bio');
    expect(response.body.user)
      .to.have.property('email')
      .that.is.equal('johnwilli@gmail.com');
  });

  it('should return a 403 forbidden error when user tries to login with unverified email', async () => {
    // unverify user
    await User.update({ isVerified: false }, { where: { email: realUser.email.toLowerCase() } });
    // log in user
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(realUser);
    expect(response).to.have.status(403);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
  });

  it('should return a status code of 401 and a message for invalid credentials', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(wrongEmail);
    expect(response).to.have.status(401);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body)
      .to.have.property('message')
      .that.is.equal('Invalid user credentials');
  });

  it('should return a message when email is empty', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(emptyEmail);
    expect(response).to.have.status(400);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body)
      .to.have.property('message')
      .that.is.equal('Email can not be empty');
  });

  it('should return a message when password less than 8 character', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(wrongLength);
    expect(response).to.have.status(400);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body)
      .to.have.property('message')
      .that.is.equal('Password must be greater than eight characters');
  });

  it('should return a message when password is empty ', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(noPass);
    expect(response).to.have.status(400);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body)
      .to.have.property('message')
      .that.is.equal('Password can not be empty');
  });

  it('should return a message when user submits a wrong password', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(realUserWithWrongPassword);
    expect(response).to.have.status(401);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body).to.have.property('message');
  });

  it('should return a message when their is Email ', async () => {
    const response = await chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(badEmail);
    expect(response).to.have.status(400);
    expect(response.body)
      .to.have.property('status')
      .that.is.equal('error');
    expect(response.body)
      .to.have.property('message')
      .that.is.equal('It seems your email is not valid, or is incorrect');
  });
});
