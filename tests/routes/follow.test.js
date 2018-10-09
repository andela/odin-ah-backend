import chai, { expect } from 'chai';
import server from '../..';
import db from '../../models';
import {
  sampleUser,
  sampleUser2,
  sampleUser3,
  sampleUser4
} from '../testHelpers/testLoginData';

const { User } = db;

let userToken = null;
let userToken2 = null;
let userId = null;
let userId3 = null;
let userId4 = null;
describe('POST /profiles/:userId/follow', () => {
  before('Register a user ', async () => {
    await User.create(sampleUser);
  });
  before('Register a user ', async () => {
    const response = await User.create(sampleUser2);
    userId = response.dataValues.id;
  });
  before('Register a user ', async () => {
    const response = await User.create(sampleUser3);
    userId3 = response.dataValues.id;
  });
  before('Register a user ', async () => {
    const response = await User.create(sampleUser4);
    userId4 = response.dataValues.id;
  });
  before('login a user and get the token', async () => {
    const { body } = await chai.request(server)
      .post('/api/v1/auth/login')
      .send(sampleUser);
    userToken = body.user.token;
  });


  it('should return a 200 status code when users successfully follow another user', async () => {
    const response = await chai.request(server)
      .post(`/api/v1/profiles/${userId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });

  it('should return a 409 status code and a message when you follow a user that does not exit', async () => {
    const response = await chai.request(server)
      .post(`/api/v1/profiles/${userId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(409);
    expect(response.body.status).to.equal('error');
    expect(response.body).to.have.property('message');
  });

  it('should return a 404 when you try to follow a user you already following', async () => {
    const response = await chai.request(server)
      .post('/api/v1/profiles/000/follow')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(404);
    expect(response.body.status).to.equal('error');
  });

  it('should return a 400 status code and a message when you enter an invalid ID', async () => {
    const response = await chai.request(server)
      .post('/api/v1/profiles/----236&Y*(Y&*U/follow')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(400);
    expect(response.body.status).to.equal('error');
  });
});

describe('DELETE /profiles/:userId/follow', () => {
  it('should return a 200 status code when users successfully unfollow another user', async () => {
    const response = await chai.request(server)
      .delete(`/api/v1/profiles/${userId}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
  });

  it('should return a 401 status code and a message when visitor try to unfollow a user', async () => {
    const response = await chai.request(server)
      .post('/api/v1/profiles/000/follow')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(404);
    expect(response.body.status).to.equal('error');
  });
});

// const dumm = '/api/v1/articles?page=1&size=3'
describe('GET /profiles/following', () => {
  before('login a user and get the new token', async () => {
    const { body } = await chai.request(server)
      .post('/api/v1/auth/login')
      .send(sampleUser3);
    userToken2 = body.user.token;
  });
  before('follow other users', async () => {
    await chai.request(server)
      .post(`/api/v1/profiles/${userId3}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
  });
  before('follow other users', async () => {
    await chai.request(server)
      .post(`/api/v1/profiles/${userId4}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
  });
  it('should return a 200 status code and a list of users I am following ', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/following')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body.data).to.have.property('usersIFollow')
      .that.is.not.empty;
  });
  it('should return a 200 status code when user is not following anyone yet', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/following')
      .set('Authorization', `Bearer ${userToken2}`);
    expect(response).to.have.status(200);
  });
});

describe('GET /profiles/follower', () => {
  before('login a user and get the new token', async () => {
    const { body } = await chai.request(server)
      .post('/api/v1/auth/login')
      .send(sampleUser3);
    userToken2 = body.user.token;
  });
  before('follow other users', async () => {
    await chai.request(server)
      .post(`/api/v1/profiles/${userId3}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
  });
  before('follow other users', async () => {
    await chai.request(server)
      .post(`/api/v1/profiles/${userId4}/follow`)
      .set('Authorization', `Bearer ${userToken}`);
  });
  it('should return a 200 status code and a list of users folling me ', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/follower')
      .set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    // expect(response.body.data).to.have.property('myFollowers')
    //     .that.is.not.empty;
  });
  it('should return a 200 status code when user is not following anyone yet', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/follower')
      .set('Authorization', `Bearer ${userToken2}`);
    expect(response).to.have.status(200);
  });
});
