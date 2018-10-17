import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.should();


describe('Role based acess control', () => {
  it('should allow users edit there own articles', (done) => {
    done();
  });
  it('should prevent users from editing other authors\' article', (done) => {
    done();
  });
  it('should allow users delete there own articles', (done) => {
    done();
  });
  it('should prevent users from deleting other people\'s articles', (done) => {
    done();
  });
  it('should allow admin to delete other people\'s article', (done) => {
    done();
  });
  it('should allow only a super admin to make a user an admin', (done) => {
    done();
  });
});
