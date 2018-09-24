import { Router } from 'express';
import UserController from '../../controllers/UserController';

const router = Router();

router.get('/user', UserController.getUser);

router.put('/user', UserController.updateUser);

router.post('/users/login', UserController.loginUser);

router.post('/users', UserController.createUser);

export default router;
