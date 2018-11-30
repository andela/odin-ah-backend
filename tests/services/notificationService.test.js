import chai from 'chai';
import chaiHttp from 'chai-http';
import * as sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import MailNotificationService from '../../services/mailNotificationService';
import { realUser, realUser1, realUser2 } from '../testHelpers/testLoginData';
import Util from '../../helpers/Util';
import db from '../../models';
import server from '../../index';
import Mail from '../../services/Mail';
import Authorization from '../../middlewares/Authorization';
import { defaultArticle } from '../testHelpers/articleUtil';
import { deleteTable } from '../testHelpers';
import { createDummySeries, seriesContent } from '../testHelpers/seriesUtil';


const {
  User, Article, Comment, FollowSeries, Series
} = db;
const { expect } = chai;
chai.use(chaiHttp);

describe('Mail Notification service', () => {
  let user = null;
  let follower1 = null;
  let follower2 = null;
  let article;
  const fakeSendGridResponse = Promise.resolve([
    { statusCode: 202 },
    {
      status: 'success',
    }
  ]);
  before(async () => {
    await Promise.all([
      deleteTable(User), deleteTable(Article), deleteTable(Comment),
    ]);
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
        slug: 'random-slug-that-does-not-make-sense'
      },
      createDummySeries(user))
    ]);
    const userToken1 = Authorization.generateToken(follower1);
    const userToken2 = Authorization.generateToken(follower2);

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
    it('should send email notification to userA when another userB follows userA,'
      + ' only if newFollower settings is true', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      await user.update({
        settings: {
          newFollower: false,
          emailSubscribe: true,
        }
      });
      const res = await MailNotificationService.onFollowEvent({
        toUser: user.id,
        fromUser: follower1.id
      });
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


    it(`should not send notification to userA when another userB follows userA,
        only if newFollower settings is false`, async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      await user.update({
        settings: {
          newFollower: false,
          emailSubscribe: false,
        }
      });
      const res = await MailNotificationService.onFollowEvent({
        toUser: user.id,
        fromUser: follower1.id
      });
      expect(res)
        .to
        .be
        .equal(undefined);
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
      expect(res)
        .to
        .be
        .equal(undefined);
      mockUserFindOne.restore();
    });
  });
  describe('onNewPostEvent', () => {
    it('should throw an error', async () => {
      const mockUserFindOne = sinon.stub(User, 'findOne')
        .rejects();
      await user.update({
        settings: {
          newArticleFromUserFollowing: false,
        }
      });
      const res = await MailNotificationService.onNewPostEvent({
        toUser: user.id,
        fromUser: follower2.id
      });

      expect(res)
        .to
        .be
        .equal(undefined);
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

      expect(res)
        .to
        .be
        .equal(undefined);
      mockUserFindOne.restore();
    });
  });
  describe('sendLikeNotification', () => {
    it('should send mail if article is liked', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      const res = await Mail.sendLikeNotification({
        recipientEmail: 'victor@andela.com',
        fromUsername: 'victor',
        articleTitle: 'how I to move like the wind',
        articleSlug: 'how-I-to-move-like-the-wind-j3L8YdDE',
      });
      expect(res)
        .to
        .be
        .an('object');
      expect(res)
        .to
        .have
        .property('status')
        .that
        .is
        .equal('success');
      mockSGMailSend.restore();
    });
  });
  describe('followArticleNotification', () => {
    it('should send notification to all userA followers if userA publish an article', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      const recipients = [
        {
          recipientEmail: 'victor@gmail.com',
          recipientName: 'dummy-1'
        },
        {
          recipientEmail: 'victor@gmail.com',
          recipientName: 'dummy-1'
        }];
      const res = await Mail.followArticleNotification({
        recipients,
        author: 'victor',
        articleTitle: 'how I to move like the wind',
        articleSlug: 'how-I-to-move-like-the-wind-j3L8YdDE',
      });
      expect(res)
        .to
        .be
        .an('Array');
      expect(res[0])
        .to
        .have
        .property('status')
        .that
        .is
        .equal('success');
      mockSGMailSend.restore();
    });
  });
  describe('onFollowSeriesEvent', () => {
    let series, eventInfo;
    beforeEach(async () => {
      series = await Series.create(seriesContent)
        .then(result => result.setUser(user));
      const status = 'FOLLOW';
      await Promise.all([
        FollowSeries.create({
          userId: follower1.id,
          status,
          seriesId: series.id
        }),
      ]);
      eventInfo = {
        slug: series.slug,
        fromUser: follower1.id,
        event: 'follow'
      };
    });
    it('should send email notification to the author when a user follows the author\'s series,'
      + ' only if newFollowerOnSeries settings is true', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      await user.update({
        settings: {
          newFollowerOnSeries: false,
          emailSubscribe: true,
        }
      });
      const res = await MailNotificationService.onFollowSeriesEvent(eventInfo);
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
    it('should not send notification to the author when a user follows the author\'s,'
      + ' only if newFollowerOnSeries settings is false', async () => {
      const mockSGMailSend = sinon.stub(sgMail, 'send')
        .returns(fakeSendGridResponse);
      await user.update({
        settings: {
          newFollowerOnSeries: true,
          emailSubscribe: false,
        }
      });
      const res = await MailNotificationService.onFollowSeriesEvent(eventInfo);
      expect(res)
        .to
        .be
        .equal(undefined);
      mockSGMailSend.restore();
    });
    it('should throw an error', async () => {
      const mockUserFindOne = sinon.stub(User, 'findOne')
        .rejects();
      await user.update({
        settings: {
          newFollowerOnSeries: false,
        }
      });
      const res = await MailNotificationService.onFollowSeriesEvent(eventInfo);
      expect(res)
        .to
        .be
        .equal(undefined);
      mockUserFindOne.restore();
    });
  });
});
