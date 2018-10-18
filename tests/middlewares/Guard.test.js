import chai from 'chai';
import sinon from 'sinon';
import Guard from '../../middlewares/Guard';

chai.should();


describe('Guard controller', () => {
  const req = {
    authData: {
      role: 'admin'
    }
  };
  const res = {};
  it('should call the next function without error, when user\'s role is allowed', (done) => {
    const GuardMiddleware = Guard.allow('admin');
    const next = sinon.spy();
    GuardMiddleware(req, res, next);
    next.calledOnce.should.be.true;
    next.firstCall.args.length.should.be.equal(0);
    done();
  });
  it('should call the next function with an error, when user\'s role is not allowed', (done) => {
    const GuardMiddleware = Guard.allow('admin');
    req.authData.role = 'user';
    const next = sinon.spy();
    GuardMiddleware(req, res, next);
    next.calledOnce.should.be.true;
    next.firstCall.args.length.should.be.equal(1);
    done();
  });
  it('should call the next function with an error, when allowed role does not exist', (done) => {
    const GuardMiddleware = Guard.allow('unknown');
    const next = sinon.spy();
    GuardMiddleware(req, res, next);
    next.calledOnce.should.be.true;
    next.firstCall.args.length.should.be.equal(1);
    done();
  });
});
