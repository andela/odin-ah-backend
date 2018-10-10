import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { mockReq, mockRes } from 'sinon-express-mock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Authorization from '../../middlewares/Authorization';

chai.use(sinonChai);

describe('Authorization', () => {
  const res = mockRes();
  const userId = 1;
  const token = Authorization.generateToken(userId);
  const expiredToken = jwt.sign({
    userId
  },
  process.env.JWTSECRET, {
    expiresIn: '0s',
  });
  const realReq = mockReq({
    headers: {
      authorization: `Bearer: ${token}`
    }
  });
  const badReq = mockReq({
    headers: {
      authorization: 'Bearer: abjhhsjhsgh'
    }
  });
  const noReq = mockReq({
    headers: {}
  });
  const expiredTokenRequest = mockReq({
    headers: {
      authorization: `Bearer: ${expiredToken}`
    }
  });
  it('should return a token', () => {
    expect(token).to.be.a('string');
  });
  it('should call the next middleware ', async () => {
    const next = sinon.spy();
    await Authorization.verifyToken(realReq, res, next);
    expect(realReq.authData).to.not.equal('undefined');
    // eslint-disable-next-line no-unused-expressions
    expect(next).to.have.been.called;
  });
  it('should return a 401 status code  and a message', async () => {
    const next = sinon.spy();
    await Authorization.verifyToken(badReq, res, next);
    expect(res.status).to.be.calledWith(401);
    expect(res.json).to.be.calledWith({
      status: 'error',
      message: 'Invalid token',
    });
  });
  it('should return a string', async () => {
    const result = await Authorization.getToken(realReq);
    expect(result).to.be.a('string');
  });
  it('should return a string when no token is passed', async () => {
    const result = await Authorization.getToken(noReq);
    expect(result).to.be.equal(null);
  });
  it('should return a 401 status code  and a message', async () => {
    const next = sinon.spy();
    await Authorization.verifyToken(expiredTokenRequest, res, next);
    expect(res.status).to.be.calledWith(401);
    expect(res.json).to.be.calledWith({
      status: 'error',
      message: 'Access Token has Expired.',
    });
  });
});
