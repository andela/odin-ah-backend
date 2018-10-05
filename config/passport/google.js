import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AuthController from '../../controllers/auth/AuthController';
import { MockStrategy } from '../../helpers/passportMockStrategy';

const strategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`
  },
  AuthController.strategyCallback
);

const mockStrategy = new MockStrategy('google', AuthController.strategyCallback);
const googleStrategy = process.env.NODE_ENV === 'test' ? mockStrategy : strategy;

export default googleStrategy;
