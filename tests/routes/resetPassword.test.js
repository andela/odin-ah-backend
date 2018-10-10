import chai, {
  expect
} from 'chai';
import sinon from 'sinon';
import server from '../../index';
import UserHelper from '../../helpers/UserHelper';
import Util from '../../helpers/Util';
import Mail from '../../services/Mail';


const user = {
  email: 'resettester@havenmail.com',
  username: 'resettester',
  password: 'testedokay',
};
const beginResetEndpoint = '/api/v1/users/reset-password/begin';
const completeResetEndpoint = '/api/v1/users/reset-password/complete';
const {
  email,
  password
} = user;
const invalidResetToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXBkYXRlZEF0IjoiMjAxOC0xMC0wN1QxMToxODowMC41
NjZaIiwiaWF0IjoxNTM4OTEyNTkxLCJleHAiOjE1Mzg5MzA1OTF9.WfcF4CG3QqBeXCSk4yoGFg-`;
let unknownUserToken = '';
let resetToken = '';
describe('Reset Password', () => {
  before('Register user', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send(user)
      .end(async () => {
        const {
          id,
          updatedAt
        } = await UserHelper.findByEmail(email);
        resetToken = Util.generateToken({
          id
        }, Util.dateToString(updatedAt));
        unknownUserToken = Util.generateToken({
          id: 419
        }, Util.dateToString(updatedAt));
        done();
      });
  });
  describe(`POST ${beginResetEndpoint}`, () => {
    it('should return success response if email exists', (done) => {
      chai.request(server)
        .post(beginResetEndpoint)
        .send({
          email
        })
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.property('status')
            .that.is.equal('success');
          expect(response.body).to.have.property('message');
          done();
        });
    });
    it('should return error response if email does not exist', (done) => {
      chai.request(server)
        .post(beginResetEndpoint)
        .send({
          email: 'jarever555@invalidmails.com'
        })
        .end((err, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          expect(response.body).to.have.property('message');
          done();
        });
    });
    it('should return error response if email is not provided', (done) => {
      chai.request(server)
        .post(`${beginResetEndpoint}`)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          expect(response.body).to.have.property('message');
          done();
        });
    });
    it('should resolve Mail.sendPasswordReset method', (done) => {
      const mockMail = sinon.stub(Mail, 'sendPasswordReset').resolves();
      chai.request(server)
        .post(beginResetEndpoint)
        .send({
          email
        })
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.property('status')
            .that.is.equal('success');
          expect(response.body).to.have.property('message');
          mockMail.restore();
          done();
        });
    });
    it('should throw error to logger if Mail.sendPasswordReset recieves error status', (done) => {
      const mockMail = sinon.stub(Mail, 'sendPasswordReset').returns(Promise.resolve([{
        status: 'error',
        message: 'error sending mail'
      }]));
      chai.request(server)
        .post(beginResetEndpoint)
        .send({
          email
        })
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.property('status')
            .that.is.equal('success');
          expect(response.body).to.have.property('message');
          mockMail.restore();
          done();
        });
    });
  });
  describe(`POST ${completeResetEndpoint}`, () => {
    it('should return success response for a valid token and password', (done) => {
      chai.request(server)
        .post(`${completeResetEndpoint}/${resetToken}`)
        .send({
          password
        })
        .end((err, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.property('status')
            .that.is.equal('success');
          done();
        });
    });

    it('should return error response for an invalid token', (done) => {
      chai.request(server)
        .post(`${completeResetEndpoint}/${invalidResetToken}`)
        .send({
          password
        })
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          done();
        });
    });

    it('should return error response if token has been used', (done) => {
      chai.request(server)
        .post(`${completeResetEndpoint}/${resetToken}`)
        .send({
          password: 'jarever555'
        })
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          done();
        });
    });

    it('should return error response if user does not exist', (done) => {
      chai.request(server)
        .post(`${completeResetEndpoint}/${unknownUserToken}`)
        .send({
          password: 'jarever555'
        })
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          done();
        });
    });

    it('should return error response if password is not provided', (done) => {
      chai.request(server)
        .post(`${completeResetEndpoint}/${resetToken}`)
        .end((err, response) => {
          expect(response).to.have.status(400);
          expect(response.body).to.have.property('status')
            .that.is.equal('error');
          done();
        });
    });
  });
});
