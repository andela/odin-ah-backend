import chai from 'chai';

import sgMail from '@sendgrid/mail';
import * as sinon from 'sinon';
import Mail from '../../services/Mail';
import { realUser } from '../testHelpers/testLoginData';
import Util from '../../helpers/Util';
import db from '../../models';

const { User } = db;
const { expect } = chai;
describe('Mail', () => {
  let user = null;
  before(async () => {
    await User.destroy({
      truncate: true,
      cascade: true
    });
    user = await User.create({
      ...realUser,
      token: Util.generateRandomString(32)
    });
  });

  describe('sendVerification', () => {
    it('should return a successful status when email has been sent.', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 202 },
          {
            status: 'success',
          }
        ]));
      const res = await Mail.sendVerification(user);
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('success');
      mockSGMailSend.restore();
    });
    it('should return an error status when sending email fails', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 203 },
          {
            status: 'error',
          }
        ]));
      const res = await Mail.sendVerification(user);
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('error');
      expect(res)
        .to
        .have
        .property('message');
      mockSGMailSend.restore();
    });
    it('should handle unexpected errors and return an error message', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.reject(new Error('mock reject')));
      const res = await Mail.sendVerification(user);
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('error');
      expect(res)
        .to
        .have
        .property('message');
      mockSGMailSend.restore();
    });
  });

  describe('sendPasswordReset', () => {
    it('should return a successful status when email has been sent.', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 202 },
          {
            status: 'success',
          }
        ]));
      const res = await Mail.sendPasswordReset('testingurl@authorshavenand.com',
        'http://localhost:3000/api/v1/users/reset-password/complete/{token_here}');
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('success');
      mockSGMailSend.restore();
    });
    it('should return an error status when sending email fails', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 203 },
          {
            status: 'error',
          }
        ]));
      const res = await Mail.sendPasswordReset('testingurl@authorshavenand.com',
        'http://localhost:3000/api/v1/users/reset-password/complete/{token_here}');
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('error');
      expect(res)
        .to
        .have
        .property('message');
      mockSGMailSend.restore();
    });
    it('should handle unexpected errors and return an error message', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.reject(new Error('mock reject')));
      const res = await Mail.sendPasswordReset('testingurl@authorshavenand.com',
        'http://localhost:3000/api/v1/users/reset-password/complete/{token_here}');
      expect(res)
        .to
        .be
        .a('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('error');
      expect(res)
        .to
        .have
        .property('message');
      mockSGMailSend.restore();
    });
  });
});
