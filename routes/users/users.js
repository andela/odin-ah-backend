import { Router } from 'express';
import auth from '../../middlewares/Authorization';
import userProfile from '../../controllers/user/UserProfile';
import profileValidator from '../../middlewares/validators/ProfileValidator';
import UserController from '../../controllers/user/UserController';
import Validator from '../../middlewares/validators';

const router = Router();


router.put('/', auth.verifyToken, profileValidator.validation, userProfile.updateProfile);
router.get('/', auth.verifyToken, userProfile.getProfile);

router.post('/reset-password/begin', Validator.User.beginResetPassword, UserController.beginResetPassword);
router.post('/reset-password/complete/:token', Validator.User.completeResetPassword, UserController.completePasswordReset);

export default router;
