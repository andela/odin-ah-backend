import chai from 'chai';
import chaiHttp from 'chai-http';
import * as sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import {
  MailNotificationService
} from '../../services/mailNotificationService';
import { realUser, realUser1, realUser2 } from '../testHelpers/testLoginData';
import Util from '../../helpers/Util';
import db from '../../models';
import server from '../../index';
import Authorization from '../../middlewares/Authorization';
import defaultArticle from '../testHelpers/articleUtil';

const { User, Article, Comment } = db;
const { expect } = chai;
chai.use(chaiHttp);

describe('Mail Notification service', () => {
  let user = null;
  let follower1 = null;
  let follower2 = null;
  let article;
  before(async () => {
    await User.destroy({
      truncate: true,
      cascade: true
    });
    await Article.destroy({
      truncate: true,
      cascade: true
    });
    await Comment.destroy({
      truncate: true,
      cascade: true
    });
    [user, follower1, follower2, article] = await Promise.all([
      User.create({
        ...realUser,
        token: Util.generateRandomString(32)
      }),
      User.create({
        ...realUser1,
        token: Util.generateRandomString(32)
      }),
      User.create({
        ...realUser2,
        token: Util.generateRandomString(32),
        settings: {
          newArticleFromUserFollowing: false,
        }
      }),
      Article.create({
        ...defaultArticle,
        comment: 'nice'
      })
    ]);
    const userToken1 = Authorization.generateToken(follower1.id);
    const userToken2 = Authorization.generateToken(follower2.id);

    const request1 = chai.request(server)
      .post(`/api/v1/profiles/${user.id}/follow`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({});
    const request2 = chai.request(server)
      .post(`/api/v1/profiles/${user.id}/follow`)
      .set('Authorization', `Bearer ${userToken2}`)
      .send({});
    await Promise.all([request1, request2, article.setUser(user)]);
  });
  describe('onFollowEvent', () => {
    it('should send notification to userA when another userB follows userA,'
            + ' only if newFollower settings is true', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 202 },
          {
            status: 'success',
          }
        ]));
      const res = await MailNotificationService.onFollowEvent({
        toUser: user.id,
        fromUser: follower1.id
      });
      expect(res).to.be.a('object');
      expect(res).to.have.property('status').that.is.equal('success');
      mockSGMailSend.restore();
    });
    it('should not send notification to userA when another userB follows userA,'
            + ' only if newFollower settings is false', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(Promise.resolve([
          { statusCode: 202 },
          {
            status: 'success',
          }
        ]));
      await user.update({
        settings: {
          newFollower: false,
        }
      });
      const res = await MailNotificationService.onFollowEvent({
        toUser: user.id,
        fromUser: follower1.id
      });
      expect(res).to.be.equal(null);
      mockSGMailSend.restore();
    });
    it('should throw an error', async () => {
      const mockUserFindOne = sinon.stub(User, 'findOne')
        .rejects();
      await user.update({
        settings: {
          newFollower: false,
        }
      });
      const res = await MailNotificationService.onFollowEvent({
        toUser: user.id,
        fromUser: follower1.id
      });

      expect(res).to.be.equal(undefined);
      mockUserFindOne.restore();
    });
  });
  describe('onNewPostEvent', () => {
    it('should throw an error', async () => {
      const mockUserFindOne = sinon.stub(User, 'findOne').rejects();
      await user.update({
        settings: {
          newArticleFromUserFollowing: false,
        }
      });
      const res = await MailNotificationService.onNewPostEvent({
        toUser: user.id,
        fromUser: follower2.id
      });

      expect(res).to.be.equal(undefined);
      mockUserFindOne.restore();
    });
  });
  describe('onArticleInteraction', () => {
    it('should throw an error', async () => {
      const mockUserFindOne = sinon.stub(User, 'findOne')
        .rejects();
      await user.update({
        settings: {
          articleComment: false,
        }
      });
      const res = await MailNotificationService.onArticleInteraction({
        toUser: user.id,
        fromUser: follower1.id
      });

      expect(res).to.be.equal(undefined);
      mockUserFindOne.restore();
    });
  });
});
