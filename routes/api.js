import { Router } from 'express';
import auth from './auth/index';
import users from './users/index';
import errorhandler from '../middlewares/errorHandler';


const router = Router();

router.use(
  '/api/v1',
  auth,
  users,
  errorhandler,
);

export default router;
