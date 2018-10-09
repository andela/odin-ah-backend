import sgMail from '@sendgrid/mail';
import * as sinon from 'sinon';
import db from '../../models';
import Mail from '../../services/Mail';
import { realUser } from '../testHelpers/testLoginData';
import verificationToken from '../../helpers/verificationToken';

const { User } = db;
describe('Mail', () => {
  before(async () => {
    await User.destroy({
      truncate: true,
      cascade: true
    });
  });
  it('should send verification mail', async () => {
    const mockSGMailSend = sinon.stub(sgMail, 'send').returns(Promise.resolve([
      { statusCode: 202 },
      {
        status: 'success',
      }
    ]));
    const user = await User.create({ ...realUser, token: verificationToken() });
    Mail.sendVerification(user);
    mockSGMailSend.restore();
  });
});
