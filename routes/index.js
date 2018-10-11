import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorhandler from '../helpers/exceptionHandler/errorHandler';
import Authorization from '../middlewares/Authorization';
import articles from './article';
import like from './like';
import profiles from './profiles';


const router = Router();

router.use(
  '/api/v1',
  Authorization.secureRoutes,
  auth,
  users,
  articles,
  like,
  profiles,
  errorhandler,
);

export default router;
