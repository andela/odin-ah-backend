import { Strategy as TwitterStrategy } from 'passport-twitter';
import AuthController from '../../controllers/auth/AuthController';
import { MockStrategy } from '../../helpers/passportMockStrategy';

const strategy = new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
    includeEmail: true
  },
  AuthController.strategyCallback
);

const mockStrategy = new MockStrategy('twitter', AuthController.strategyCallback);
const twitterStrategy = process.env.NODE_ENV === 'test' ? mockStrategy : strategy;

export default twitterStrategy;
