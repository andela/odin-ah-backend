import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorhandler from '../helpers/exceptionHandler/errorHandler';
import Authorization from '../middlewares/Authorization';
import articles from './article';
import like from './like';
import profiles from './profiles';
import bookmark from './bookmark';
import searchRouter from './search';

const router = Router();

router.use(
  '/api/v1',
  Authorization.secureRoutes,
  searchRouter,
  auth,
  users,
  articles,
  like,
  profiles,
  bookmark,
  errorhandler
);

export default router;
