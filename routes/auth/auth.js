import { Router } from 'express';
import AuthController from '../../controllers/auth/AuthController';
import AuthValidator from '../../middlewares/validators/AuthValidator';

const router = Router();

router.post('/login', AuthValidator.validateLogin, AuthController.login);
// signup and forget password route comes here

export default router;
