import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorhandler from '../helpers/exceptionHandler/errorHandler';
import articles from './article';
import like from './like';


const router = Router();

router.use(
  '/api/v1',
  auth,
  users,
  articles,
  like,
  errorhandler,
);

export default router;
