import chai from 'chai';

import sgMail from '@sendgrid/mail';
import * as sinon from 'sinon';
import Mail from '../../services/Mail';

const { expect } = chai;
describe('sendPasswordReset() method', () => {
  it('should send an email when called', async () => {
    const mockSGMailSend = sinon.stub(sgMail, 'send').returns(Promise.resolve([
      { statusCode: 202 },
      {
        status: 'success',
      }
    ]));
    const res = await Mail.sendPasswordReset('testingurl@authorshavenand.com',
      'http://localhost:3000/api/v1/users/reset-password/complete/{token_here}');
    expect(res).to.be.a('object');
    expect(res).to.have.property('status')
      .that.is.equal('success');
    mockSGMailSend.restore();
  });
});
