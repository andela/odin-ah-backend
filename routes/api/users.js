import { Router } from 'express';
import UserController from '../../controllers/UserController';
import authRoute from './auth';

const router = Router();

router.put('/user', UserController.updateUser);

router.post('/users', UserController.createUser);

router.use('/users', authRoute);

export default router;
