import { Router } from 'express';
import AuthController from '../../controllers/AuthController';
import AuthValidator from '../../middlewares/validators/AuthValidator';

const router = Router();

router.post('/login', AuthValidator.validateLogin, AuthController.login);

export default router;
