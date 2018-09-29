import { Router } from 'express';
import auth from './auth/index';
import users from './users/index';

const router = Router();

router.use(
  '/api/v1',
  auth,
  users,
);

export default router;
