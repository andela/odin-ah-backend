import { Router } from 'express';
import AuthController from '../../controllers/auth/AuthController';
import AuthValidator from '../../middlewares/validators/AuthValidator';
import Mail from '../../services/Mail';

const router = Router();

router.post('/login', AuthValidator.validateLogin, AuthController.login);
router.post('/signup', AuthValidator.validatesignup, AuthController.signUp, Mail.sendVerification);
router.get('/confirmation/:token', AuthController.verifyUser);

// signup and forget password route comes here

export default router;
