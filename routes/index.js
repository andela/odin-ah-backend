import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorhandler from '../helpers/exceptionHandler/errorHandler';
import articles from './article';


const router = Router();

router.use(
  '/api/v1',
  auth,
  users,
  articles,
  errorhandler,
);

export default router;
