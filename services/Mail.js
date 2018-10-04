import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import MailHelper from '../helpers/MailHelper';
import emailMessages from './mailMessage';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @exports Mail
 * @class Mail
 * @description Handles the user verification mail sending
 *
 */
class Mail {
  /**
   * @static
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @return {json} Returns json object
   * @memberof Mail
   */
  static sendVerification(req, res, next) {
    const { email, token } = req.user;
    const url = `http://localhost:3000/api/v1/auth/confirmation/${token}`;
    const subject = 'Confirmation Email';
    const { message } = emailMessages.signupVerification(email, url);
    const messageInfo = MailHelper.buildMessage(email, subject, message);
    sgMail
      .send(messageInfo)
      .then((resp) => {
        if (resp[0].statusCode === 202) {
          return res.status(201).send({
            status: 'success',
            message: req.message,
          });
        }
        return res.status(400).send({
          status: 'error',
          message: 'email not sent'
        });
      })
      .catch(err => next(err));
  }
}

export default Mail;
