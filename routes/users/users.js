import { Router } from 'express';
import auth from '../../middlewares/Authorization';
import profileController from '../../controllers/profile/ProfileController';
import profileValidator from '../../middlewares/validators/ProfileValidator';
import UserController from '../../controllers/user/UserController';
import Validator from '../../middlewares/validators';
import asyncCatchErrors from '../../middlewares/asyncCatchErrors';

const router = Router();


router.put('/', auth.verifyToken, profileValidator.validation, asyncCatchErrors(profileController.updateProfile));
router.get('/', auth.verifyToken, asyncCatchErrors(profileController.getProfile));

router.post('/reset-password/begin', Validator.User.beginResetPassword, asyncCatchErrors(UserController.beginResetPassword));
router.post('/reset-password/complete/:token', Validator.User.completeResetPassword, UserController.completePasswordReset);

export default router;
