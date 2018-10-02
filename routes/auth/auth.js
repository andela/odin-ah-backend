import { Router } from 'express';
import AuthController from '../../controllers/auth/AuthController';
import AuthValidator from '../../middlewares/validators/AuthValidator';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';

const router = Router();

router.post('/login', AuthValidator.validateLogin, asyncCatchErrors(AuthController.login));
// signup and forget password route comes here

export default router;
