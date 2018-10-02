import { Router } from 'express';
import auth from './auth';
import users from './users';
import errorhandler from '../helpers/exceptionHandler/errorHandler';


const router = Router();

router.use(
  '/api/v1',
  auth,
  users,
  errorhandler,
);

export default router;
