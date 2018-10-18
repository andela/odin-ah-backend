import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import server from '../../index';
import { realUser } from '../testHelpers/testLoginData';
import testUserData from '../testHelpers/testUserData';
import Authorization from '../../middlewares/Authorization';
// import UserHelper from '../../helpers/UserHelper';
import { deleteTable } from '../testHelpers';
import db from '../../models';

let accessToken;
let superAdminAccessToken;

chai.use(chaiHttp);
chai.should();

const { User } = db;

let userId;

describe('Profile', () => {
  before('Destoy', async () => {
    await deleteTable(User);
  });
  before('Create a user Account', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/signup')
      .send(realUser)
      .end(() => {
        done();
      });
  });
  before('Create a number of users', (done) => {
    User.bulkCreate(testUserData)
      .then(() => {
        done();
      }).catch(() => {
        done();
      });
  });
  before('Get a user\'s id', async () => {
    const [user] = await User.findAll();
    userId = user.id;
  });
  before('Verify user email', async () => {
    await User.update({ isVerified: true }, { where: { email: { $not: null } } });
  });
  before('Login a user', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(realUser)
      .end((err, response) => {
        const { user } = response.body;
        const { token } = user;
        accessToken = token;
        done();
      });
  });
  before('Login a superadmin', (done) => {
    chai
      .request(server)
      .post('/api/v1/auth/login')
      .send(testUserData[0])
      .end((err, response) => {
        const { user } = response.body;
        const { token } = user;
        superAdminAccessToken = token;
        done();
      });
  });
  it('should return error for Profile that does not exist', (done) => {
    const token = Authorization.generateToken({ id: 10000, role: 'user' });
    chai
      .request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, response) => {
        response.should.have.status(404);
        response.body.should.have.property('message').equal('User not found');
        done();
      });
  });
  it('should show user profile details', (done) => {
    chai
      .request(server)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(200);
        response.body.should.have.property('message').equal('Successfully retrieved user profile!');
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
      imageUrl: 'http://www.url-to-an-image.com',
      settings: JSON.stringify({
        articleLike: true,
        newFollower: true,
        articleComment: true,
        emailSubscribe: true,
        newArticleFromUserFollowing: true
      })
    };
    chai
      .request(server)
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
        response.body.data.should.not.have.property('password');
        response.body.data.should.not.have.property('token');
        response.body.should.have.property('message').equal('Profile Updated Successfully!');
        done();
      });
  });
  it('should return 400 status if settings object is a boolean', (done) => {
    chai
      .request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'Johnwilli@gmail.com',
        username: 'blackshady',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com',
        settings: JSON.stringify({
          articleLike: 'true',
          newFollower: 'true',
          articleComment: 'true',
          emailSubscribe: 'true',
          newArticleFromUserFollowing: 'true'
        })
      })
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('message');
        response.body.should.have.property('message').equal('Invalid type! Must be a boolean');
        done();
      });
  });
  it('should return 400 status if settings properties are not valid', (done) => {
    const userData = {
      email: 'Johnwilli@gmail.com',
      username: 'blackshady',
      firstName: 'First',
      lastName: 'Name',
      bio: 'Some description about the user',
      imageUrl: 'http://www.url-to-an-image.com',
      settings: JSON.stringify({
        articleLikes: true,
        newFollowers: true,
        articleComments: true,
        emailSubscribes: true,
        newArticleFromUserFollowings: true
      })
    };
    chai
      .request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(userData)
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('message');
        response.body.should.have.property('message').equal('Invalid Properties');
        done();
      });
  });

  it('should return 400 status if username is empty', (done) => {
    chai
      .request(server)
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
        response.body.should.have.property('message').equal('Username cannot be empty');
        done();
      });
  });
  it('should return 400 status if username is not alphanumeric', (done) => {
    chai.request(server)
      .put('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'Johnwilli@gmail.com',
        username: '~{}/><>?????><',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('message');
        done();
      });
  });
  it('should return 400 status if email is empty', (done) => {
    chai
      .request(server)
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
    const token = Authorization.generateToken({ id: 10000, role: 'user' });
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
        email: testUserData[0].email,
        username: 'much',
        firstName: 'First',
        lastName: 'Name',
        bio: 'Some description about the user',
        imageUrl: 'http://www.url-to-an-image.com'
      })
      .end((err, response) => {
        response.should.have.status(409);
        response.body.should.have
          .property('message')
          .equal('This Email already exists, choose another email');
        done();
      });
  });
  it('should return success response and get list of authors', (done) => {
    chai.request(server)
      .get('/api/v1/users/list?page=1&size=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(200);
        response.body.should.have.property('status');
        response.body.should.have.property('data');
        response.body.data.should.have.property('total');
        response.body.data.should.have.property('size');
        response.body.data.should.have.property('page');
        response.body.data.should.have.property('authors');
        response.body.data.authors.should.be.a('array');
        response.body.data.authors[0].should.be.a('object');
        done();
      });
  });
  it('should return 500 status if there was an error finding all users', (done) => {
    const userStub = sinon.stub(User, 'findAll').rejects();
    chai.request(server)
      .get('/api/v1/users/list?page=1&size=2')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        userStub.restore();
        response.should.have.status(500);
        response.body.should.have.property('status').that.is.equal('error');
        done();
      });
  });
  it('should return 500 status if there was an error getting user by id', (done) => {
    const userStub = sinon.stub(User, 'findById').rejects();
    chai.request(server)
      .get('/api/v1/users/2')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        userStub.restore();
        response.should.have.status(500);
        response.body.should.have.property('status').that.is.equal('error');
        done();
      });
  });
  it('should return 400 status if id is not a number', (done) => {
    chai.request(server)
      .get('/api/v1/users/yfdfsadfv')
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(400);
        response.body.should.have.property('status').that.is.equal('error');
        done();
      });
  });
  it('should return 401 unauthorized if a non superadmin tries to change a user\'s role', (done) => {
    const id = 5;
    chai.request(server)
      .put(`/api/v1/users/${id}/admin`)
      .set('Authorization', `Bearer ${accessToken}`)
      .end((err, response) => {
        response.should.have.status(401);
        response.body.should.have.property('status').that.is.equal('error');
        done();
      });
  });
  it('should return 200 success if a superadmin tries to change a user\'s role', (done) => {
    chai.request(server)
      .put(`/api/v1/users/${userId}/admin`)
      .set('Authorization', `Bearer ${superAdminAccessToken}`)
      .end((err, response) => {
        response.should.have.status(200);
        response.body.should.have.property('status').that.is.equal('success');
        done();
      });
  });
});
