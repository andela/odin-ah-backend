import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';

import { realUser } from '../testHelpers/testLoginData';
import Authorization from '../../middlewares/Authorization';

let accessToken;

chai.use(chaiHttp);
chai.should();

describe('Profile', () => {
  before('Create a user Account', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send({
        email: 'muche@mail.com',
        username: 'muche',
        password: 'password'
      })
      .end(() => {
        done();
      });
  });
  before('Login a user', (done) => {
    chai.request(server)
      .post('/api/v1/auth/login')
      .send(realUser)
      .end((err, response) => {
        const { user } = response.body;
        const { token } = user;
        accessToken = token;
        done();
      });
  });
  it('should return error for Profile that does not exist', (done) => {
    const token = Authorization.generateToken(10000);
    chai.request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, response) => {
        response.should.have.status(404);
        response.body.should.have.property('message').equal('User is not found');
        done();
      });
  });
  it('should show user profile details', (done) => {
    chai.request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(200);
        response.body.should.have.property('message').equal('Successful!');
        done();
      });
  });

  it('should allow user add Firstname, Lastname Bio and imageURL ', (done) => {
    const userData = {
      email: 'Johnwilli@gmail.com',
      username: 'blackshady',
      firstName: 'First',
      lastName: 'Name',
      bio: 'Some description about the user',
      imageUrl: 'http://www.url-to-an-image.com'
    };
    chai.request(server)
      .put('/api/v1/users')
      .send(userData)
      .set('Authorization', `Bearer: ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(200);
        response.body.should.be.a('object');
        response.body.should.have.property('data');
        response.body.data.should.have.property('firstName').eq(userData.firstName);
        response.body.data.should.have.property('lastName').eq(userData.lastName);
        response.body.data.should.have.property('bio').eq(userData.bio);
        response.body.data.should.have.property('imageUrl').eq(userData.imageUrl);
        response.body.data.should.have.property('username').eq(userData.username);
        response.body.data.should.have.property('email').eq(userData.email);
        response.body.should.have.property('message').equal('Profile Updated Successfully!');
        done();
      });
  });
  it('should return 400 status if username is empty', (done) => {
    chai.request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'Johnwilli@gmail.com',
        username: '',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('message');
        response.body.should.have.property('message').equal('Username cannot be empty');
        done();
      });
  });
  it('should return 400 status if email is empty', (done) => {
    chai.request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: '',
        username: 'blackshady',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('message');
        response.body.should.have.property('message').equal('Please enter a valid email');
        done();
      });
  });
  it('should return error for Profile that does not exist', (done) => {
    const token = Authorization.generateToken(10000);
    chai.request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'Johnwilli@gmail.com',
        username: 'blackshady',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(404);
        response.body.should.have.property('message').equal('User not found!');
        done();
      });
  });
  it('should return error if email already exist', (done) => {
    chai.request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'muche@mail.com',
        username: 'much',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(409);
        response.body.should.have.property('message');
        response.body.should.have.property('message').equal('This Email already exists, choose another email');
        done();
      });
  });
});
