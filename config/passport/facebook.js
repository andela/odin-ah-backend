import { Strategy as FacebookStrategy } from 'passport-facebook';
import AuthController from '../../controllers/auth/AuthController';
import { MockStrategy } from '../../helpers/passportMockStrategy';

const strategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'photos', 'displayName']
  },
  AuthController.strategyCallback
);

const mockStrategy = new MockStrategy('facebook', AuthController.strategyCallback);
const facebookStrategy = process.env.NODE_ENV === 'test' ? mockStrategy : strategy;

export default facebookStrategy;
