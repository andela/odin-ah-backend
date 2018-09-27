import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../index';

chai.use(chaiHttp);
chai.should();

const { expect } = chai;

describe('Dummy test', () => {
  it('should check if dummy test works', () => {
    expect('Authors Haven').to.be.a('string');
  });
});

describe('Create Account ', () => {
  it('should allow user create an new account', (done) => {
    chai.request(server)
      .post('/api/users')
      .send(
        {
          email: 'tmorolari@gmail.com',
          username: 'macphilips',
          password: 'password'
        }
      )
      .end((error, response) => {
        expect(response.status).to.eql(200);
        expect(response.body).to.be.a('object');
        response.body.should.have.property('user');
        response.body.user.should.have.property('username');
        response.body.user.should.have.property('email');
        done();
      });
  });
});

describe('Edit User ', () => {
  it('should not allow user edit if not registered', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        username: 'tommy',
        id: 1000
      })
      .end((error, response) => {
        expect(response.status).to.eql(404);
        done();
      });
  });
  it('should return edited email', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        id: 1,
        email: 'testemail@mail.com'
      })
      .end((error, response) => {
        expect(response.status).to.eql(200);
        response.body.should.be.a('object');
        response.body.should.have.property('user');
        response.body.user.should.have.property('email').eq('testemail@mail.com');
        done();
      });
  });
  it('should return edited username', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        username: 'testUser11',
        id: 1
      })
      .end((error, response) => {
        expect(response.status).to.eql(200);
        response.body.should.be.a('object');
        response.body.should.have.property('user');
        response.body.user.should.have.property('username').eq('testUser11');
        done();
      });
  });
  it('should return updated Bio', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        id: 1,
        username: 'testUser11',
        email: 'testemail@mail.com',
        bio: 'Some description about the user'
      })
      .end((error, response) => {
        expect(response.status).to.eql(200);
        response.body.should.be.a('object');
        done();
      });
  });
  it('should return updated Image', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        id: 1,
        username: 'testUser11',
        email: 'testemail@mail.com',
        bio: 'Some description about the user',
        image: 'imgUrl'
      })
      .end((error, response) => {
        expect(response.status).to.eql(200);
        response.body.should.be.a('object');
        done();
      });
  });
  it('should return updated Password', (done) => {
    chai.request(server)
      .put('/api/user')
      .send({
        id: 1,
        username: 'testUser11',
        email: 'testemail@mail.com',
        bio: 'Some description about the user',
        image: 'imgUrl',
        password: 'newpassword'
      })
      .end((error, response) => {
        expect(response.status).to.eql(200);
        response.body.should.be.a('object');
        done();
      });
  });
});
