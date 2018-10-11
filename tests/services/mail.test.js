import chai from 'chai';
import Mail from '../../services/Mail';

const { expect } = chai;
describe('sendPasswordReset() method', () => {
  it('should send an email when called', (done) => {
    Mail.sendPasswordReset('testingurl@authorshavenand.com',
      'http://localhost:3000/api/v1/users/reset-password/complete/{token_here}')
      .then((res) => {
        expect(res).to.be.a('object');
        expect(res).to.have.property('status')
          .that.is.equal('success');
        done();
      })
  });
});
