import chai, { expect } from 'chai';
import server from '../..';
import db from '../../models';
import { sampleUser5, sampleUser6, fakeNotification } from '../testHelpers/testLoginData';
import Authorization from '../../middlewares/Authorization';

const { User, Notifications } = db;
let userToken1 = '';
let userToken2 = '';
let userId1 = '';
let userId2 = '';
let notificationId = '';
describe('GET /profiles/notifications', () => {
  before('Register a user', async () => {
    const response = await User.create(sampleUser5);
    userId1 = response.dataValues.id;
    userToken1 = Authorization.generateToken(userId1);
  });
  before('create a fake notification', async () => {
    await Notifications.create(fakeNotification);
  });
  before('Register a user ', async () => {
    const response = await User.create(sampleUser6);
    userId2 = response.dataValues.id;
    userToken2 = Authorization.generateToken(userId2);
  });

  before('Follow a user', async () => {
    await chai.request(server)
      .post(`/api/v1/profiles/${userId2}/follow`)
      .set('Authorization', `Bearer: ${userToken1}`);
  });

  it('should return a status code and a message if user do not have any notification ', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/notification')
      .set('Authorization', `Bearer: ${userToken1}`);
    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message').that.is.equal('You do not have any notification yet');
  });

  it('get the user notifications', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/notification')
      .set('Authorization', `Bearer: ${userToken2}`);
    notificationId = response.body.userNotification[0].id;
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.userNotification[0]).to.not.be.empty;
    expect(response.body.userNotification[0]).to.have.property('id').that.is.a('number');
    expect(response.body.userNotification[0]).to.have.property('isRead').that.is.a('boolean');
    expect(response.body.userNotification[0]).to.have.property('message').that.is.a('string');
  });
  it('should delete the notification if it has been read and has stayed more than a day', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/notification')
      .set('Authorization', `Bearer: ${userToken2}`);
    notificationId = response.body.userNotification[0].id;
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.userNotification[0]).to.not.be.empty;
    expect(response.body.userNotification[0]).to.have.property('id').that.is.a('number');
    expect(response.body.userNotification[0]).to.have.property('isRead').that.is.a('boolean');
    expect(response.body.userNotification[0]).to.have.property('message').that.is.a('string');
  });
});

describe('PUT /profiles/notifications', () => {
  it('update notification state', async () => {
    const response = await chai.request(server)
      .put(`/api/v1/profiles/notification/${notificationId}`)
      .set('Authorization', `Bearer ${userToken2}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
    expect(response.body).to.have.property('message').that.is.equal('notification have been updated');
  });

  it('check if notification has been read ', async () => {
    const response = await chai.request(server)
      .get('/api/v1/profiles/notification')
      .set('Authorization', `Bearer ${userToken2}`);
    expect(response).to.have.status(200);
    expect(response.body.status).to.equal('success');
    expect(response.body.userNotification[0]).to.not.be.empty;
    expect(response.body.userNotification[0]).to.have.property('id').that.is.a('number');
    expect(response.body.userNotification[0]).to.have.property('isRead').to.be.true;
  });

  it('throw error if notification does not exist', async () => {
    const response = await chai.request(server)
      .put('/api/v1/profiles/notification/0')
      .set('Authorization', `Bearer ${userToken1}`);
    expect(response).to.have.status(404);
    expect(response.body.status).to.equal('error');
    expect(response.body).to.have.property('message').that.is.equal('notification does not exist');
  });
});
